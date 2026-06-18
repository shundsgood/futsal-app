import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MATCH_RESULT_LABEL, MATCH_RESULT_COLOR, GOAL_TYPE_LABEL } from "@/lib/constants";

type Props = { params: Promise<{ teamId: string }> };

export default async function MatchesPage({ params }: Props) {
  const { teamId } = await params;

  const matches = await prisma.match.findMany({
    where: { teamId },
    include: {
      event: { select: { id: true, title: true, startDatetime: true } },
      goals: {
        include: { scorer: { select: { displayName: true } } },
        orderBy: { goalOrder: "asc" },
      },
    },
    orderBy: [
      { event: { startDatetime: "desc" } },
      { matchOrder: "asc" },
    ],
  });

  const returnTo = `/teams/${teamId}/matches`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">試合一覧</h2>
        <Link
          href={`/teams/${teamId}/matches/new`}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
        >
          ＋ 試合を追加
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          試合記録がまだありません
        </div>
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => {
            const scorers = match.goals
              .map((g) =>
                g.goalType === "normal"
                  ? (g.scorer?.displayName ?? "—")
                  : (GOAL_TYPE_LABEL[g.goalType] ?? g.goalType),
              )
              .join("、");

            const editHref = match.event
              ? `/teams/${teamId}/events/${match.event.id}/matches/${match.id}/edit?returnTo=${encodeURIComponent(returnTo)}`
              : `/teams/${teamId}/matches/${match.id}/edit?returnTo=${encodeURIComponent(returnTo)}`;

            return (
              <li key={match.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                {/* 上段: 活動名 + 試合番号 + 勝敗 + 編集 */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    {match.event ? (
                      <Link
                        href={`/teams/${teamId}/events/${match.event.id}`}
                        className="text-xs font-medium text-blue-600 hover:underline block truncate"
                      >
                        {match.event.title}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">活動なし</span>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {match.event
                        ? new Date(match.event.startDatetime).toLocaleDateString("ja-JP", {
                            month: "numeric",
                            day: "numeric",
                            weekday: "short",
                          }) + `　第${match.matchOrder}試合`
                        : `第${match.matchOrder}試合`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        MATCH_RESULT_COLOR[match.result] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {MATCH_RESULT_LABEL[match.result] ?? match.result}
                    </span>
                    <Link href={editHref} className="text-xs text-gray-400 hover:text-blue-600">
                      編集
                    </Link>
                  </div>
                </div>

                {/* 中段: スコア + 対戦相手 */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">
                    {match.ourScore} - {match.opponentScore}
                  </span>
                  <span className="text-sm text-gray-500">vs {match.opponentName}</span>
                </div>

                {/* 下段: 得点者 + URL */}
                {(scorers || match.matchUrl) && (
                  <div className="mt-1.5 space-y-0.5">
                    {scorers && (
                      <p className="text-xs text-gray-500 truncate">得点: {scorers}</p>
                    )}
                    {match.matchUrl && (
                      <a
                        href={match.matchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline block truncate"
                      >
                        {match.matchUrl}
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
