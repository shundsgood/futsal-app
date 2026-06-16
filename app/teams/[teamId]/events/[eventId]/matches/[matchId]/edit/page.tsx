import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchEditForm } from "./MatchEditForm";

type Props = { params: Promise<{ teamId: string; eventId: string; matchId: string }> };

export default async function EditMatchPage({ params }: Props) {
  const { teamId, eventId, matchId } = await params;

  const [match, attendances, allMembers] = await Promise.all([
    prisma.match.findFirst({
      where: { id: matchId, eventId, event: { teamId } },
      include: { players: { select: { teamMemberId: true } } },
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

  if (!match) notFound();

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

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">試合結果を編集</h2>
      <p className="text-sm text-gray-500 mb-4">第{match.matchOrder}試合</p>

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
        />
      </div>
    </div>
  );
}
