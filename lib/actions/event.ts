"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VALID_ATTENDANCE_STATUSES } from "@/lib/constants";
import { parseDatetimeLocalJST } from "@/lib/utils";

const RESPONSE_TO_ATTENDANCE: Record<string, string> = {
  available: "attending",
  maybe: "undecided",
  unavailable: "absent",
};

export async function confirmPollOptions(
  pollId: string,
  optionIds: string[],
  teamId: string,
): Promise<{ error: string } | undefined> {
  const user = await getCurrentUser();

  if (optionIds.length === 0) return { error: "日程を1つ以上選択してください" };

  const [poll, activeMembers] = await Promise.all([
    prisma.schedulePoll.findFirst({
      where: { id: pollId, teamId },
      include: {
        options: {
          where: { id: { in: optionIds } },
          include: { responses: true },
        },
      },
    }),
    prisma.teamMember.findMany({
      where: { teamId, membershipStatus: { not: "left" } },
    }),
  ]);

  if (!poll) return { error: "日程調整が見つかりません" };
  if (poll.status !== "open") return { error: "この日程調整はすでに確定済みです" };
  if (poll.options.length === 0) return { error: "有効な候補日が見つかりません" };

  let alreadyConfirmed = false;
  await prisma.$transaction(async (tx) => {
    const updated = await tx.schedulePoll.updateMany({
      where: { id: pollId, status: "open" },
      data: { status: "confirmed" },
    });
    if (updated.count === 0) {
      alreadyConfirmed = true;
      return;
    }

    for (const option of poll.options) {
      const existing = await tx.event.findFirst({
        where: { sourcePollId: pollId, startDatetime: option.startDatetime },
      });
      if (existing) continue;

      const responseMap = new Map(option.responses.map((r) => [r.teamMemberId, r.responseType]));

      await tx.event.create({
        data: {
          teamId,
          sourcePollId: pollId,
          title: poll.title,
          description: poll.description,
          eventType: poll.eventType,
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
    }
  });

  if (alreadyConfirmed) return { error: "この日程調整はすでに確定済みです" };
  revalidateTag(`team-${teamId}`, "max");
}

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

    const existing = await tx.event.findFirst({
      where: { sourcePollId: pollId, startDatetime: option.startDatetime },
    });
    if (existing) return existing;

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

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/events/${event.id}`);
}

export async function createEvent(teamId: string, formData: FormData) {
  const user = await getCurrentUser();

  const title = (formData.get("title") as string | null)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  const eventType = (formData.get("eventType") as string | null) || null;
  const startDatetime = formData.get("startDatetime") as string | null;
  if (!startDatetime) throw new Error("開始日時は必須です");

  const endDatetime = (formData.get("endDatetime") as string | null) || null;
  const venueName = (formData.get("venueName") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const note = (formData.get("note") as string | null)?.trim() || null;

  const activeMembers = await prisma.teamMember.findMany({
    where: { teamId, membershipStatus: { not: "left" } },
  });

  const event = await prisma.event.create({
    data: {
      teamId,
      title,
      eventType,
      startDatetime: parseDatetimeLocalJST(startDatetime),
      endDatetime: endDatetime ? parseDatetimeLocalJST(endDatetime) : null,
      venueName,
      description,
      note,
      status: "confirmed",
      createdBy: user.id,
      attendances: {
        create: activeMembers.map((m) => ({
          teamMemberId: m.id,
          status: "undecided",
        })),
      },
    },
  });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/events/${event.id}`);
}

export async function updateEvent(eventId: string, teamId: string, formData: FormData) {
  const event = await prisma.event.findFirst({ where: { id: eventId, teamId } });
  if (!event) throw new Error("イベントが見つかりません");

  const title = (formData.get("title") as string | null)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  const eventType = (formData.get("eventType") as string | null) || null;
  const startDatetime = formData.get("startDatetime") as string | null;
  if (!startDatetime) throw new Error("開始日時は必須です");

  const endDatetime = (formData.get("endDatetime") as string | null) || null;
  const venueName = (formData.get("venueName") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;
  const note = (formData.get("note") as string | null)?.trim() || null;
  const finalRank = (formData.get("finalRank") as string | null)?.trim() || null;

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      eventType,
      startDatetime: parseDatetimeLocalJST(startDatetime),
      endDatetime: endDatetime ? parseDatetimeLocalJST(endDatetime) : null,
      venueName,
      description,
      note,
      finalRank,
    },
  });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/events/${eventId}`);
}

export async function deleteEvent(eventId: string, teamId: string) {
  const event = await prisma.event.findFirst({ where: { id: eventId, teamId } });
  if (!event) throw new Error("イベントが見つかりません");

  await prisma.event.delete({ where: { id: eventId } });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/events`);
}

export async function deleteEvents(eventIds: string[], teamId: string) {
  if (eventIds.length === 0) return;
  await prisma.event.deleteMany({
    where: { id: { in: eventIds }, teamId },
  });
  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/events`);
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

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/events/${eventId}`);
}
