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
        <div className="bg-white rounded-xl border border-gray-200 flex">
          {/* データ列（横スクロール可） */}
          <div className="flex-1 overflow-x-auto min-w-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">活動</th>
                  <th className="text-center px-2 py-2.5 font-medium text-gray-500 whitespace-nowrap">結果</th>
                  <th className="text-center px-2 py-2.5 font-medium text-gray-500 whitespace-nowrap">スコア</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">対戦相手</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">得点者</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const scorers = match.goals
                    .map((g) =>
                      g.goalType === "normal"
                        ? (g.scorer?.displayName ?? "—")
                        : (GOAL_TYPE_LABEL[g.goalType] ?? g.goalType),
                    )
                    .join("、");

                  return (
                    <tr key={match.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      {/* 活動名 + 日付 */}
                      <td className="px-3 py-2.5">
                        {match.event ? (
                          <Link
                            href={`/teams/${teamId}/events/${match.event.id}`}
                            className="block text-xs font-medium text-blue-600 hover:underline truncate max-w-[120px]"
                          >
                            {match.event.title}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">活動なし</span>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                          {match.event
                            ? new Date(match.event.startDatetime).toLocaleDateString("ja-JP", {
                                month: "numeric",
                                day: "numeric",
                              }) + ` 第${match.matchOrder}試合`
                            : `第${match.matchOrder}試合`}
                        </p>
                      </td>

                      {/* 勝敗バッジ */}
                      <td className="px-2 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            MATCH_RESULT_COLOR[match.result] ?? "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {MATCH_RESULT_LABEL[match.result] ?? match.result}
                        </span>
                      </td>

                      {/* スコア */}
                      <td className="px-2 py-2.5 text-center font-bold tabular-nums whitespace-nowrap text-gray-900">
                        {match.ourScore} - {match.opponentScore}
                      </td>

                      {/* 対戦相手（URLがあればリンク化） */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {match.matchUrl ? (
                          <a
                            href={match.matchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            {match.opponentName}
                            <svg
                              className="w-3 h-3 text-blue-400 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-gray-800">{match.opponentName}</span>
                        )}
                      </td>

                      {/* 得点者 */}
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        <span className="block truncate max-w-[120px]">{scorers || "—"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 編集列（スクロールに追従しない） */}
          <div className="shrink-0 border-l border-gray-200 flex flex-col">
            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2.5 text-xs font-medium text-gray-400 whitespace-nowrap">
              &nbsp;
            </div>
            {matches.map((match) => {
              const editHref = match.event
                ? `/teams/${teamId}/events/${match.event.id}/matches/${match.id}/edit?returnTo=${encodeURIComponent(returnTo)}`
                : `/teams/${teamId}/matches/${match.id}/edit?returnTo=${encodeURIComponent(returnTo)}`;
              return (
                <div
                  key={match.id}
                  className="flex-1 flex items-center px-3 border-b border-gray-50 last:border-0"
                >
                  <Link href={editHref} className="text-xs text-gray-400 hover:text-blue-600 whitespace-nowrap">
                    編集
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
