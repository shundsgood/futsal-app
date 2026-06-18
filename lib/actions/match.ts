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

function parseMatchFormData(formData: FormData) {
  const matchOrderRaw = formData.get("matchOrder") as string | null;
  const opponentName = (formData.get("opponentName") as string | null)?.trim();
  const ourScoreRaw = formData.get("ourScore") as string | null;
  const opponentScoreRaw = formData.get("opponentScore") as string | null;
  const memo = (formData.get("memo") as string | null)?.trim() || null;
  const matchUrl = (formData.get("matchUrl") as string | null)?.trim() || null;
  const playerIds = formData.getAll("playerIds") as string[];

  if (!opponentName) throw new Error("対戦相手名は必須です");

  const matchOrder = matchOrderRaw ? parseInt(matchOrderRaw, 10) : 1;
  const ourScore = ourScoreRaw !== null ? parseInt(ourScoreRaw, 10) : 0;
  const opponentScore = opponentScoreRaw !== null ? parseInt(opponentScoreRaw, 10) : 0;

  if (isNaN(matchOrder) || isNaN(ourScore) || isNaN(opponentScore)) {
    throw new Error("得点は数値で入力してください");
  }
  if (ourScore < 0 || opponentScore < 0) throw new Error("得点は0以上で入力してください");
  if (ourScore > 99 || opponentScore > 99) throw new Error("得点は99以下で入力してください");

  const goals: Array<{
    goalType: string;
    scorerId: string | null;
    assistType: string;
    assistId: string | null;
    goalOrder: number;
  }> = [];
  let gi = 0;
  while (formData.has(`goalType_${gi}`)) {
    const goalType = formData.get(`goalType_${gi}`) as string;
    const scorerId =
      goalType === "normal" ? ((formData.get(`scorerId_${gi}`) as string | null) || null) : null;
    const { assistType, assistId } =
      goalType === "normal"
        ? parseAssist(formData.get(`assistValue_${gi}`) as string | null)
        : { assistType: "none", assistId: null };
    goals.push({ goalType, scorerId, assistType, assistId, goalOrder: gi + 1 });
    gi++;
  }

  return { matchOrder, opponentName, ourScore, opponentScore, memo, matchUrl, playerIds, goals };
}

export async function createMatch(eventId: string, teamId: string, formData: FormData) {
  const event = await prisma.event.findFirst({ where: { id: eventId, teamId } });
  if (!event) throw new Error("イベントが見つかりません");

  const { matchOrder, opponentName, ourScore, opponentScore, memo, matchUrl, playerIds, goals } =
    parseMatchFormData(formData);

  if (playerIds.length > 0) {
    const validCount = await prisma.teamMember.count({ where: { id: { in: playerIds }, teamId } });
    if (validCount !== playerIds.length) throw new Error("無効なメンバーが含まれています");
  }

  const result = calcResult(ourScore, opponentScore);

  await prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
      data: {
        teamId,
        eventId,
        matchOrder,
        opponentName,
        ourScore,
        opponentScore,
        result,
        memo,
        matchUrl,
        players: { create: playerIds.map((teamMemberId) => ({ teamMemberId })) },
      },
    });
    if (goals.length > 0) {
      await tx.goal.createMany({ data: goals.map((g) => ({ matchId: match.id, ...g })) });
    }
  });

  const returnTo = (formData.get("returnTo") as string | null) || `/teams/${teamId}/events/${eventId}`;
  redirect(returnTo);
}

export async function createStandaloneMatch(teamId: string, formData: FormData) {
  const { matchOrder, opponentName, ourScore, opponentScore, memo, matchUrl, playerIds, goals } =
    parseMatchFormData(formData);

  if (playerIds.length > 0) {
    const validCount = await prisma.teamMember.count({ where: { id: { in: playerIds }, teamId } });
    if (validCount !== playerIds.length) throw new Error("無効なメンバーが含まれています");
  }

  const result = calcResult(ourScore, opponentScore);

  await prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
      data: {
        teamId,
        eventId: null,
        matchOrder,
        opponentName,
        ourScore,
        opponentScore,
        result,
        memo,
        matchUrl,
        players: { create: playerIds.map((teamMemberId) => ({ teamMemberId })) },
      },
    });
    if (goals.length > 0) {
      await tx.goal.createMany({ data: goals.map((g) => ({ matchId: match.id, ...g })) });
    }
  });

  const returnTo = (formData.get("returnTo") as string | null) || `/teams/${teamId}/matches`;
  redirect(returnTo);
}

export async function updateMatch(
  matchId: string,
  eventId: string | null,
  teamId: string,
  formData: FormData,
) {
  const match = await prisma.match.findFirst({ where: { id: matchId, teamId } });
  if (!match) throw new Error("試合が見つかりません");

  const { matchOrder, opponentName, ourScore, opponentScore, memo, matchUrl, playerIds, goals } =
    parseMatchFormData(formData);

  if (playerIds.length > 0) {
    const validCount = await prisma.teamMember.count({ where: { id: { in: playerIds }, teamId } });
    if (validCount !== playerIds.length) throw new Error("無効なメンバーが含まれています");
  }

  const result = calcResult(ourScore, opponentScore);

  await prisma.$transaction(async (tx) => {
    await tx.matchPlayer.deleteMany({ where: { matchId } });
    await tx.goal.deleteMany({ where: { matchId } });
    await tx.match.update({
      where: { id: matchId },
      data: { matchOrder, opponentName, ourScore, opponentScore, result, memo, matchUrl },
    });
    if (playerIds.length > 0) {
      await tx.matchPlayer.createMany({
        data: playerIds.map((teamMemberId) => ({ matchId, teamMemberId })),
      });
    }
    if (goals.length > 0) {
      await tx.goal.createMany({ data: goals.map((g) => ({ matchId, ...g })) });
    }
  });

  const fallback = eventId ? `/teams/${teamId}/events/${eventId}` : `/teams/${teamId}/matches`;
  const returnTo = (formData.get("returnTo") as string | null) || fallback;
  redirect(returnTo);
}

export async function deleteMatch(matchId: string, eventId: string | null, teamId: string) {
  const match = await prisma.match.findFirst({ where: { id: matchId, teamId } });
  if (!match) throw new Error("試合が見つかりません");

  await prisma.match.delete({ where: { id: matchId } });

  redirect(eventId ? `/teams/${teamId}/events/${eventId}` : `/teams/${teamId}/matches`);
}
