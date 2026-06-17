import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchEditForm } from "./MatchEditForm";

type Props = { params: Promise<{ teamId: string; eventId: string; matchId: string }> };

export default async function EditMatchPage({ params }: Props) {
  const { teamId, eventId, matchId } = await params;

  const [match, attendances, allMembers] = await Promise.all([
    prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: { select: { teamMemberId: true } },
        goals: { orderBy: { goalOrder: "asc" } },
      },
    }),
    prisma.eventAttendance.findMany({
      where: { eventId },
      select: { teamMemberId: true, status: true },
    }),
    prisma.teamMember.findMany({
      where: { teamId, membershipStatus: { not: "left" } },
      orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
    }),
  ]);

  if (!match || match.eventId !== eventId) notFound();

  const attendingIds = new Set(
    attendances.filter((a) => a.status === "attending").map((a) => a.teamMemberId),
  );
  const existingPlayerIds = new Set(match.players.map((p) => p.teamMemberId));

  const members = allMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    uniformNumber: m.uniformNumber,
    isAttending: attendingIds.has(m.id),
    isSelected: existingPlayerIds.has(m.id),
  }));

  const initialGoals = match.goals.map((g) => ({
    goalType: g.goalType as "normal" | "own_goal" | "unknown_scorer",
    scorerId: g.scorerId ?? "",
    assistValue: g.assistType === "member" ? (g.assistId ?? "") : g.assistType,
  }));

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/teams/${teamId}/events/${eventId}`} className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block">← イベントに戻る</Link>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">試合を編集</h2>
        <p className="text-sm text-gray-500">第{match.matchOrder}試合 vs {match.opponentName}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <MatchEditForm
          matchId={matchId}
          eventId={eventId}
          teamId={teamId}
          defaultValues={{
            matchOrder: match.matchOrder,
            opponentName: match.opponentName,
            ourScore: match.ourScore,
            opponentScore: match.opponentScore,
            memo: match.memo ?? "",
          }}
          members={members}
          initialGoals={initialGoals}
        />
      </div>
    </div>
  );
}
