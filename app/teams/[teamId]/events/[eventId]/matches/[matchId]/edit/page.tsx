import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchEditForm } from "./MatchEditForm";
import { GOAL_TYPE_LABEL, ASSIST_TYPE_LABEL } from "@/lib/constants";

type Props = { params: Promise<{ teamId: string; eventId: string; matchId: string }> };

export default async function EditMatchPage({ params }: Props) {
  const { teamId, eventId, matchId } = await params;

  const [match, attendances, allMembers] = await Promise.all([
    prisma.match.findFirst({
      where: { id: matchId, eventId, event: { teamId } },
      include: {
        players: { select: { teamMemberId: true } },
        goals: { include: { scorer: true, assist: true }, orderBy: { goalOrder: "asc" } },
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

  const scoreMismatch = match.goals.length !== match.ourScore;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">試合を編集</h2>
        <p className="text-sm text-gray-500">第{match.matchOrder}試合 vs {match.opponentName}</p>
      </div>

      {/* 試合フォーム */}
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

      {/* 得点記録 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">得点記録</h3>
          <Link
            href={`/teams/${teamId}/events/${eventId}/matches/${matchId}/goals/new`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + 追加
          </Link>
        </div>

        {scoreMismatch && (
          <div className="mb-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
            <span>⚠️</span>
            <span>
              得点記録数（{match.goals.length}件）とスコア（{match.ourScore}点）が一致していません
            </span>
          </div>
        )}

        {match.goals.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center text-gray-400 text-sm">
            得点記録がまだありません
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {match.goals.map((goal, i) => {
              const scorerLabel =
                goal.goalType === "normal"
                  ? (goal.scorer?.displayName ?? "（未設定）")
                  : GOAL_TYPE_LABEL[goal.goalType];

              const assistLabel =
                goal.goalType !== "normal"
                  ? null
                  : goal.assistType === "member"
                    ? (goal.assist?.displayName ?? "（未設定）")
                    : ASSIST_TYPE_LABEL[goal.assistType];

              return (
                <div key={goal.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{scorerLabel}</p>
                    {assistLabel && (
                      <p className="text-xs text-gray-400">アシスト: {assistLabel}</p>
                    )}
                    {goal.goalType !== "normal" && (
                      <p className="text-xs text-gray-400">{GOAL_TYPE_LABEL[goal.goalType]}</p>
                    )}
                  </div>
                  <Link
                    href={`/teams/${teamId}/events/${eventId}/matches/${matchId}/goals/${goal.id}/edit`}
                    className="text-xs text-gray-400 hover:text-blue-600 shrink-0"
                  >
                    編集
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
