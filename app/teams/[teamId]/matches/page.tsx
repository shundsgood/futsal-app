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
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                  活動名
                </th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                  勝敗
                </th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                  スコア
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                  対戦相手
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                  得点者
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                  URL
                </th>
                <th className="px-3 py-2.5" />
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
                  .join(", ");

                const editHref = match.event
                  ? `/teams/${teamId}/events/${match.event.id}/matches/${match.id}/edit?returnTo=${encodeURIComponent(returnTo)}`
                  : `/teams/${teamId}/matches/${match.id}/edit?returnTo=${encodeURIComponent(returnTo)}`;

                return (
                  <tr key={match.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap">
                      {match.event ? (
                        <Link
                          href={`/teams/${teamId}/events/${match.event.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {match.event.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400 font-medium">活動なし</span>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {match.event
                          ? new Date(match.event.startDatetime).toLocaleDateString("ja-JP", {
                              month: "numeric",
                              day: "numeric",
                              weekday: "short",
                            }) + ` 第${match.matchOrder}試合`
                          : `第${match.matchOrder}試合`}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          MATCH_RESULT_COLOR[match.result] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {MATCH_RESULT_LABEL[match.result] ?? match.result}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-900 tabular-nums whitespace-nowrap">
                      {match.ourScore} - {match.opponentScore}
                    </td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                      {match.opponentName}
                    </td>
                    <td className="px-3 py-3 text-gray-500 max-w-[160px]">
                      <span className="block truncate">{scorers || "—"}</span>
                    </td>
                    <td className="px-3 py-3">
                      {match.matchUrl ? (
                        <a
                          href={match.matchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs block truncate max-w-[120px]"
                        >
                          {match.matchUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Link
                        href={editHref}
                        className="text-xs text-gray-400 hover:text-blue-600"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
