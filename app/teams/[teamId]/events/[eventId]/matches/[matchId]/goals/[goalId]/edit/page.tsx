import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GoalEditForm } from "./GoalEditForm";

type Props = {
  params: Promise<{ teamId: string; eventId: string; matchId: string; goalId: string }>;
};

export default async function EditGoalPage({ params }: Props) {
  const { teamId, eventId, matchId, goalId } = await params;

  const [goal, match, allMembers] = await Promise.all([
    prisma.goal.findFirst({
      where: { id: goalId, matchId, match: { eventId, event: { teamId } } },
    }),
    prisma.match.findFirst({
      where: { id: matchId, eventId, event: { teamId } },
      include: { players: { select: { teamMemberId: true } } },
    }),
    prisma.teamMember.findMany({
      where: { teamId, membershipStatus: { not: "left" } },
      orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
    }),
  ]);

  if (!goal || !match) notFound();

  const playerIds = new Set(match.players.map((p) => p.teamMemberId));

  const members = allMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    uniformNumber: m.uniformNumber,
    isPlayer: playerIds.has(m.id),
  }));

  const initialAssistValue =
    goal.assistType === "member" && goal.assistId
      ? goal.assistId
      : (goal.assistType as string);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">得点記録を編集</h2>
      <p className="text-sm text-gray-500 mb-4">
        第{match.matchOrder}試合 vs {match.opponentName}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <GoalEditForm
          goalId={goalId}
          matchId={matchId}
          eventId={eventId}
          teamId={teamId}
          members={members}
          initialValues={{
            goalType: goal.goalType as "normal" | "own_goal" | "unknown_scorer",
            scorerId: goal.scorerId ?? "",
            assistValue: initialAssistValue,
          }}
        />
      </div>
    </div>
  );
}
