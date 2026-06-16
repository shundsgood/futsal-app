"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function parseAssist(assistValue: string | null): {
  assistType: string;
  assistId: string | null;
} {
  if (!assistValue || assistValue === "none") return { assistType: "none", assistId: null };
  if (assistValue === "unknown") return { assistType: "unknown", assistId: null };
  return { assistType: "member", assistId: assistValue };
}

export async function createGoal(
  matchId: string,
  eventId: string,
  teamId: string,
  formData: FormData,
) {
  const match = await prisma.match.findFirst({
    where: { id: matchId, eventId, event: { teamId } },
  });
  if (!match) throw new Error("試合が見つかりません");

  const goalType = (formData.get("goalType") as string | null) ?? "normal";
  const scorerId =
    goalType === "normal" ? ((formData.get("scorerId") as string | null) || null) : null;
  const { assistType, assistId } =
    goalType === "normal"
      ? parseAssist(formData.get("assistValue") as string | null)
      : { assistType: "none", assistId: null };

  const agg = await prisma.goal.aggregate({ where: { matchId }, _max: { goalOrder: true } });
  const goalOrder = (agg._max.goalOrder ?? 0) + 1;

  await prisma.goal.create({
    data: { matchId, goalType, scorerId, assistType, assistId, goalOrder },
  });

  const submitType = formData.get("_submit");
  if (submitType === "continue") {
    redirect(`/teams/${teamId}/events/${eventId}/matches/${matchId}/goals/new`);
  }
  redirect(`/teams/${teamId}/events/${eventId}/matches/${matchId}/edit`);
}

export async function updateGoal(
  goalId: string,
  matchId: string,
  eventId: string,
  teamId: string,
  formData: FormData,
) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, matchId, match: { eventId, event: { teamId } } },
  });
  if (!goal) throw new Error("得点記録が見つかりません");

  const goalType = (formData.get("goalType") as string | null) ?? "normal";
  const scorerId =
    goalType === "normal" ? ((formData.get("scorerId") as string | null) || null) : null;
  const { assistType, assistId } =
    goalType === "normal"
      ? parseAssist(formData.get("assistValue") as string | null)
      : { assistType: "none", assistId: null };

  await prisma.goal.update({
    where: { id: goalId },
    data: { goalType, scorerId, assistType, assistId },
  });

  redirect(`/teams/${teamId}/events/${eventId}/matches/${matchId}/edit`);
}

export async function deleteGoal(
  goalId: string,
  matchId: string,
  eventId: string,
  teamId: string,
) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, matchId, match: { eventId, event: { teamId } } },
  });
  if (!goal) throw new Error("得点記録が見つかりません");

  await prisma.goal.delete({ where: { id: goalId } });

  redirect(`/teams/${teamId}/events/${eventId}/matches/${matchId}/edit`);
}
