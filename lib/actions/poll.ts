"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function createPoll(teamId: string, formData: FormData) {
  const user = await getCurrentUser();

  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const eventType = (formData.get("eventType") as string | null) || null;
  const responseDeadline = formData.get("responseDeadline") as string | null;

  if (!title) throw new Error("タイトルは必須です");

  // Collect options: startDatetime_0, endDatetime_0, venueName_0, note_0, ...
  const options: {
    startDatetime: Date;
    endDatetime: Date | null;
    venueName: string | null;
    note: string | null;
    displayOrder: number;
  }[] = [];

  let i = 0;
  while (formData.has(`startDatetime_${i}`)) {
    const hasTime = formData.get(`hasTime_${i}`) === "true";
    const start = formData.get(`startDatetime_${i}`) as string;
    const end = (formData.get(`endDatetime_${i}`) as string | null) || null;
    const venue = (formData.get(`venueName_${i}`) as string | null)?.trim() || null;
    const note = (formData.get(`note_${i}`) as string | null)?.trim() || null;

    if (start) {
      const startDate = hasTime ? new Date(start) : new Date(start + "T00:00:00");
      const endDate = hasTime && end ? new Date(end) : null;
      if (hasTime && endDate && endDate <= startDate) {
        throw new Error(`候補日${i + 1}: 終了日時は開始日時より後にしてください`);
      }
      options.push({
        startDatetime: startDate,
        endDatetime: endDate,
        venueName: venue,
        note,
        displayOrder: i,
      });
    }
    i++;
  }

  if (options.length === 0) throw new Error("候補日時を1つ以上追加してください");

  const poll = await prisma.schedulePoll.create({
    data: {
      teamId,
      title,
      description,
      eventType,
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      status: "open",
      createdBy: user.id,
      options: {
        create: options,
      },
    },
  });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/polls/${poll.id}`);
}

export async function submitPollResponse(
  pollId: string,
  teamId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();

  const [member, poll] = await Promise.all([
    prisma.teamMember.findFirst({ where: { teamId, userId: user.id } }),
    prisma.schedulePoll.findFirst({ where: { id: pollId, teamId } }),
  ]);
  if (!member) throw new Error("このチームのメンバーではありません");
  if (!poll) throw new Error("日程調整が見つかりません");

  const options = await prisma.schedulePollOption.findMany({
    where: { schedulePollId: pollId },
  });

  await prisma.$transaction(
    options.flatMap((option) => {
      const responseType = formData.get(`response_${option.id}`) as string | null;
      if (!responseType) return [];
      const comment = (formData.get(`comment_${option.id}`) as string | null)?.trim() || null;
      return [
        prisma.schedulePollResponse.upsert({
          where: {
            schedulePollOptionId_teamMemberId: {
              schedulePollOptionId: option.id,
              teamMemberId: member.id,
            },
          },
          update: { responseType, comment },
          create: {
            schedulePollOptionId: option.id,
            teamMemberId: member.id,
            responseType,
            comment,
          },
        }),
      ];
    }),
  );

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/polls/${pollId}`);
}

export async function updatePollOptions(
  pollId: string,
  teamId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const poll = await prisma.schedulePoll.findFirst({
    where: { id: pollId, teamId },
    include: { options: { select: { id: true } } },
  });
  if (!poll) return { error: "日程調整が見つかりません" };
  if (poll.status === "confirmed") return { error: "確定済みの日程調整は編集できません" };

  const existingIds = new Set(poll.options.map((o) => o.id));
  const keptIds = new Set<string>();

  type OptionFields = {
    startDatetime: Date;
    endDatetime: Date | null;
    venueName: string | null;
    note: string | null;
    displayOrder: number;
  };
  const toUpdate: Array<{ id: string; data: OptionFields }> = [];
  const toCreate: Array<OptionFields> = [];

  let i = 0;
  while (formData.has(`startDatetime_${i}`)) {
    const hasTime = formData.get(`hasTime_${i}`) === "true";
    const start = formData.get(`startDatetime_${i}`) as string;
    const end = (formData.get(`endDatetime_${i}`) as string | null) || null;
    const venue = (formData.get(`venueName_${i}`) as string | null)?.trim() || null;
    const note = (formData.get(`note_${i}`) as string | null)?.trim() || null;
    const existingId = (formData.get(`existingOptionId_${i}`) as string | null) || null;

    if (start) {
      const startDate = hasTime ? new Date(start) : new Date(start + "T00:00:00");
      const endDate = hasTime && end ? new Date(end) : null;
      if (hasTime && endDate && endDate <= startDate) {
        return { error: `候補日${i + 1}: 終了日時は開始日時より後にしてください` };
      }
      const optionData: OptionFields = {
        startDatetime: startDate,
        endDatetime: endDate,
        venueName: venue,
        note,
        displayOrder: i,
      };
      if (existingId && existingIds.has(existingId)) {
        keptIds.add(existingId);
        toUpdate.push({ id: existingId, data: optionData });
      } else {
        toCreate.push(optionData);
      }
    }
    i++;
  }

  if (toUpdate.length + toCreate.length === 0) {
    return { error: "候補日時を1つ以上追加してください" };
  }

  const toDelete = poll.options.map((o) => o.id).filter((id) => !keptIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length > 0) {
      await tx.schedulePollOption.deleteMany({ where: { id: { in: toDelete } } });
    }
    for (const u of toUpdate) {
      await tx.schedulePollOption.update({ where: { id: u.id }, data: u.data });
    }
    for (const fields of toCreate) {
      await tx.schedulePollOption.create({ data: { schedulePollId: pollId, ...fields } });
    }
  });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/polls/${pollId}`);
}

export async function updatePollInfo(
  pollId: string,
  teamId: string,
  formData: FormData,
) {
  const poll = await prisma.schedulePoll.findFirst({ where: { id: pollId, teamId } });
  if (!poll) throw new Error("日程調整が見つかりません");

  const title = (formData.get("title") as string).trim();
  if (!title) throw new Error("タイトルは必須です");

  const description = (formData.get("description") as string | null)?.trim() || null;
  const eventType = (formData.get("eventType") as string | null) || null;
  const responseDeadline = (formData.get("responseDeadline") as string | null) || null;

  await prisma.schedulePoll.update({
    where: { id: pollId },
    data: {
      title,
      description,
      eventType,
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
    },
  });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/polls/${pollId}`);
}

export async function deletePolls(pollIds: string[], teamId: string) {
  if (pollIds.length === 0) return;
  await prisma.schedulePoll.deleteMany({
    where: { id: { in: pollIds }, teamId },
  });
  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/polls`);
}

export async function reopenPoll(pollId: string, teamId: string) {
  const poll = await prisma.schedulePoll.findFirst({
    where: { id: pollId, teamId },
  });
  if (!poll) throw new Error("日程調整が見つかりません");
  if (poll.status !== "confirmed") throw new Error("確定済みの日程調整のみ戻せます");

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.schedulePoll.update({ where: { id: pollId }, data: { status: "open" } });
    await tx.event.deleteMany({
      where: { sourcePollId: pollId, status: "confirmed", startDatetime: { gt: now } },
    });
  });

  revalidateTag(`team-${teamId}`, "max");
  redirect(`/teams/${teamId}/polls/${pollId}`);
}
