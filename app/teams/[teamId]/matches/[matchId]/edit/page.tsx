import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchEditForm } from "@/app/teams/[teamId]/events/[eventId]/matches/[matchId]/edit/MatchEditForm";

type Props = {
  params: Promise<{ teamId: string; matchId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditStandaloneMatchPage({ params, searchParams }: Props) {
  const { teamId, matchId } = await params;
  const { returnTo } = await searchParams;

  const [match, allMembers] = await Promise.all([
    prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: { select: { teamMemberId: true } },
        goals: { orderBy: { goalOrder: "asc" } },
      },
    }),
    prisma.teamMember.findMany({
      where: { teamId, membershipStatus: { not: "left" } },
      orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
    }),
  ]);

  if (!match || match.teamId !== teamId) notFound();

  const existingPlayerIds = new Set(match.players.map((p) => p.teamMemberId));

  const members = allMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    uniformNumber: m.uniformNumber,
    isAttending: false,
    isSelected: existingPlayerIds.has(m.id),
  }));

  const initialGoals = match.goals.map((g) => ({
    goalType: g.goalType as "normal" | "own_goal" | "unknown_scorer",
    scorerId: g.scorerId ?? "",
    assistValue: g.assistType === "member" ? (g.assistId ?? "") : g.assistType,
  }));

  const backHref = returnTo ?? `/teams/${teamId}/matches`;

  return (
    <div className="space-y-5">
      <div>
        <Link href={backHref} className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block">
          ← 試合一覧に戻る
        </Link>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">試合を編集</h2>
        <p className="text-sm text-gray-500">第{match.matchOrder}試合 vs {match.opponentName}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <MatchEditForm
          matchId={matchId}
          eventId={null}
          teamId={teamId}
          defaultValues={{
            matchOrder: match.matchOrder,
            opponentName: match.opponentName,
            ourScore: match.ourScore,
            opponentScore: match.opponentScore,
            memo: match.memo ?? "",
            matchUrl: match.matchUrl ?? "",
          }}
          members={members}
          initialGoals={initialGoals}
          returnTo={backHref}
        />
      </div>
    </div>
  );
}
