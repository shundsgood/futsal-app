"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function parseAssist(assistValue: string | null): { assistType: string; assistId: string | null } {
  if (!assistValue || assistValue === "none") return { assistType: "none", assistId: null };
  if (assistValue === "unknown") return { assistType: "unknown", assistId: null };
  return { assistType: "member", assistId: assistValue };
}

function calcResult(ourScore: number, opponentScore: number): string {
  if (ourScore > opponentScore) return "win";
  if (ourScore === opponentScore) return "draw";
  return "loss";
}

export async function createMatch(eventId: string, teamId: string, formData: FormData) {
  const event = await prisma.event.findFirst({ where: { id: eventId, teamId } });
  if (!event) throw new Error("イベントが見つかりません");

  const matchOrderRaw = formData.get("matchOrder") as string | null;
  const opponentName = (formData.get("opponentName") as string | null)?.trim();
  const ourScoreRaw = formData.get("ourScore") as string | null;
  const opponentScoreRaw = formData.get("opponentScore") as string | null;
  const memo = (formData.get("memo") as string | null)?.trim() || null;
  const playerIds = formData.getAll("playerIds") as string[];

  if (!opponentName) throw new Error("対戦相手名は必須です");

  const matchOrder = matchOrderRaw ? parseInt(matchOrderRaw, 10) : 1;
  const ourScore = ourScoreRaw !== null ? parseInt(ourScoreRaw, 10) : 0;
  const opponentScore = opponentScoreRaw !== null ? parseInt(opponentScoreRaw, 10) : 0;

  if (isNaN(matchOrder) || isNaN(ourScore) || isNaN(opponentScore)) {
    throw new Error("得点は数値で入力してください");
  }
  if (ourScore < 0 || opponentScore < 0) throw new Error("得点は0以上で入力してください");

  const result = calcResult(ourScore, opponentScore);

  await prisma.match.create({
    data: {
      eventId,
      matchOrder,
      opponentName,
      ourScore,
      opponentScore,
      result,
      memo,
      players: {
        create: playerIds.map((teamMemberId) => ({ teamMemberId })),
      },
    },
  });

  redirect(`/teams/${teamId}/events/${eventId}`);
}

export async function updateMatch(
  matchId: string,
  eventId: string,
  teamId: string,
  formData: FormData,
) {
  const match = await prisma.match.findFirst({
    where: { id: matchId, eventId, event: { teamId } },
  });
  if (!match) throw new Error("試合が見つかりません");

  const matchOrderRaw = formData.get("matchOrder") as string | null;
  const opponentName = (formData.get("opponentName") as string | null)?.trim();
  const ourScoreRaw = formData.get("ourScore") as string | null;
  const opponentScoreRaw = formData.get("opponentScore") as string | null;
  const memo = (formData.get("memo") as string | null)?.trim() || null;
  const playerIds = formData.getAll("playerIds") as string[];

  if (!opponentName) throw new Error("対戦相手名は必須です");

  const matchOrder = matchOrderRaw ? parseInt(matchOrderRaw, 10) : 1;
  const ourScore = ourScoreRaw !== null ? parseInt(ourScoreRaw, 10) : 0;
  const opponentScore = opponentScoreRaw !== null ? parseInt(opponentScoreRaw, 10) : 0;

  if (isNaN(matchOrder) || isNaN(ourScore) || isNaN(opponentScore)) {
    throw new Error("得点は数値で入力してください");
  }
  if (ourScore < 0 || opponentScore < 0) throw new Error("得点は0以上で入力してください");

  const result = calcResult(ourScore, opponentScore);

  // parse goals from form
  const goals: Array<{
    goalType: string;
    scorerId: string | null;
    assistType: string;
    assistId: string | null;
    goalOrder: number;
  }> = [];
  let i = 0;
  while (formData.has(`goalType_${i}`)) {
    const goalType = formData.get(`goalType_${i}`) as string;
    const scorerId =
      goalType === "normal" ? ((formData.get(`scorerId_${i}`) as string | null) || null) : null;
    const { assistType, assistId } =
      goalType === "normal"
        ? parseAssist(formData.get(`assistValue_${i}`) as string | null)
        : { assistType: "none", assistId: null };
    goals.push({ goalType, scorerId, assistType, assistId, goalOrder: i + 1 });
    i++;
  }

  await prisma.$transaction(async (tx) => {
    await tx.matchPlayer.deleteMany({ where: { matchId } });
    await tx.goal.deleteMany({ where: { matchId } });
    await tx.match.update({
      where: { id: matchId },
      data: { matchOrder, opponentName, ourScore, opponentScore, result, memo },
    });
    if (playerIds.length > 0) {
      await tx.matchPlayer.createMany({
        data: playerIds.map((teamMemberId) => ({ matchId, teamMemberId })),
      });
    }
    if (goals.length > 0) {
      await tx.goal.createMany({
        data: goals.map((g) => ({ matchId, ...g })),
      });
    }
  });

  redirect(`/teams/${teamId}/events/${eventId}`);
}

export async function deleteMatch(matchId: string, eventId: string, teamId: string) {
  const match = await prisma.match.findFirst({
    where: { id: matchId, eventId, event: { teamId } },
  });
  if (!match) throw new Error("試合が見つかりません");

  await prisma.match.delete({ where: { id: matchId } });

  redirect(`/teams/${teamId}/events/${eventId}`);
}
