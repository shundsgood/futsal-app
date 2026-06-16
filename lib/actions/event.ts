"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VALID_ATTENDANCE_STATUSES } from "@/lib/constants";

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

  // optionId と pollId の整合性確認
  if (option.schedulePollId !== pollId) throw new Error("不正なリクエストです");
  if (option.poll.teamId !== teamId) throw new Error("不正なリクエストです");

  // 二重作成防止: poll.status が open でなければブロック
  if (option.poll.status !== "open") {
    const existingEvent = await prisma.event.findFirst({
      where: { sourcePollId: pollId },
    });
    if (existingEvent) redirect(`/teams/${teamId}/events/${existingEvent.id}`);
    throw new Error("この日程調整はすでに確定済みです");
  }

  const responseMap = new Map(option.responses.map((r) => [r.teamMemberId, r.responseType]));

  // poll の status 更新と event 作成をトランザクションで実行
  const event = await prisma.$transaction(async (tx) => {
    // updateMany で "open" のものだけ更新し、count=0 なら他リクエストが先に確定済み
    const updated = await tx.schedulePoll.updateMany({
      where: { id: pollId, status: "open" },
      data: { status: "confirmed" },
    });
    if (updated.count === 0) {
      throw new Error("この日程調整はすでに確定済みです");
    }

    return tx.event.create({
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
  });

  redirect(`/teams/${teamId}/events/${event.id}`);
}

export async function submitEventAttendance(
  eventId: string,
  teamId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();

  const [member, event] = await Promise.all([
    prisma.teamMember.findFirst({ where: { teamId, userId: user.id } }),
    prisma.event.findFirst({ where: { id: eventId, teamId } }),
  ]);

  if (!member) throw new Error("このチームのメンバーではありません");
  if (!event) throw new Error("イベントが見つかりません");

  const status = formData.get("status") as string | null;
  const comment = (formData.get("comment") as string | null)?.trim() || null;

  if (!status || !VALID_ATTENDANCE_STATUSES.includes(status as typeof VALID_ATTENDANCE_STATUSES[number])) {
    throw new Error("出欠を正しく選択してください");
  }

  await prisma.eventAttendance.upsert({
    where: {
      eventId_teamMemberId: { eventId, teamMemberId: member.id },
    },
    update: { status, comment },
    create: { eventId, teamMemberId: member.id, status, comment },
  });

  redirect(`/teams/${teamId}/events/${eventId}`);
}
