"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const RESPONSE_TO_ATTENDANCE: Record<string, string> = {
  available: "attending",
  maybe: "undecided",
  unavailable: "absent",
};

export async function confirmPoll(pollId: string, optionId: string, teamId: string) {
  const user = await getCurrentUser();

  const [option, activeMembers] = await Promise.all([
    prisma.schedulePollOption.findUniqueOrThrow({
      where: { id: optionId },
      include: {
        poll: true,
        responses: true,
      },
    }),
    prisma.teamMember.findMany({
      where: { teamId, membershipStatus: { not: "left" } },
    }),
  ]);

  if (option.poll.teamId !== teamId) throw new Error("不正なリクエストです");

  const responseMap = new Map(option.responses.map((r) => [r.teamMemberId, r.responseType]));

  const event = await prisma.event.create({
    data: {
      teamId,
      sourcePollId: pollId,
      title: option.poll.title,
      description: option.poll.description,
      eventType: option.poll.eventType,
      startDatetime: option.startDatetime,
      endDatetime: option.endDatetime,
      venueName: option.venueName,
      note: option.note,
      status: "confirmed",
      createdBy: user.id,
      attendances: {
        create: activeMembers.map((m) => {
          const responseType = responseMap.get(m.id);
          return {
            teamMemberId: m.id,
            status: RESPONSE_TO_ATTENDANCE[responseType ?? ""] ?? "undecided",
          };
        }),
      },
    },
  });

  await prisma.schedulePoll.update({
    where: { id: pollId },
    data: { status: "confirmed" },
  });

  redirect(`/teams/${teamId}/events/${event.id}`);
}

export async function submitEventAttendance(
  eventId: string,
  teamId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
  });
  if (!member) throw new Error("このチームのメンバーではありません");

  const status = formData.get("status") as string | null;
  const comment = (formData.get("comment") as string | null)?.trim() || null;

  if (!status) throw new Error("出欠を選択してください");

  await prisma.eventAttendance.upsert({
    where: {
      eventId_teamMemberId: { eventId, teamMemberId: member.id },
    },
    update: { status, comment },
    create: { eventId, teamMemberId: member.id, status, comment },
  });

  redirect(`/teams/${teamId}/events/${eventId}`);
}
