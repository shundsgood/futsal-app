import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GoalForm } from "./GoalForm";

type Props = { params: Promise<{ teamId: string; eventId: string; matchId: string }> };

export default async function NewGoalPage({ params }: Props) {
  const { teamId, eventId, matchId } = await params;

  const [match, allMembers, goalCount] = await Promise.all([
    prisma.match.findFirst({
      where: { id: matchId, eventId, event: { teamId } },
      include: { players: { include: { teamMember: true } } },
    }),
    prisma.teamMember.findMany({
      where: { teamId, membershipStatus: { not: "left" } },
      orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
    }),
    prisma.goal.count({ where: { matchId } }),
  ]);

  if (!match) notFound();

  const playerIds = new Set(match.players.map((p) => p.teamMemberId));
  const players = match.players.map((p) => p.teamMember);

  const members = allMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    uniformNumber: m.uniformNumber,
    isPlayer: playerIds.has(m.id),
  }));

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">得点を追加</h2>
      <p className="text-sm text-gray-500 mb-4">
        第{match.matchOrder}試合 vs {match.opponentName}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <GoalForm
          matchId={matchId}
          eventId={eventId}
          teamId={teamId}
          members={members}
          defaultGoalOrder={goalCount + 1}
        />
      </div>
    </div>
  );
}
