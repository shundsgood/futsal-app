"use server";

import { redirect } from "next/navigation";
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
    const start = formData.get(`startDatetime_${i}`) as string;
    const end = formData.get(`endDatetime_${i}`) as string | null;
    const venue = (formData.get(`venueName_${i}`) as string | null)?.trim() || null;
    const note = (formData.get(`note_${i}`) as string | null)?.trim() || null;

    if (start) {
      options.push({
        startDatetime: new Date(start),
        endDatetime: end ? new Date(end) : null,
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

  redirect(`/teams/${teamId}/polls/${poll.id}`);
}

export async function submitPollResponse(
  pollId: string,
  teamId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
  });
  if (!member) throw new Error("このチームのメンバーではありません");

  const options = await prisma.schedulePollOption.findMany({
    where: { schedulePollId: pollId },
  });

  for (const option of options) {
    const responseType = formData.get(`response_${option.id}`) as string | null;
    const comment = (formData.get(`comment_${option.id}`) as string | null)?.trim() || null;

    if (!responseType) continue;

    await prisma.schedulePollResponse.upsert({
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
    });
  }

  redirect(`/teams/${teamId}/polls/${pollId}`);
}
