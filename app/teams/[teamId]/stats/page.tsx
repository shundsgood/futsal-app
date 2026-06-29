import { prisma } from "@/lib/prisma";
import { StatsFilter } from "@/app/_components/StatsFilter";
import { dateToSeason, seasonToDateRange } from "@/lib/utils";

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ level?: string; season?: string; from?: string; to?: string }>;
};

type MemberStat = {
  id: string;
  displayName: string;
  uniformNumber: number | null;
  played: number;
  goals: number;
  assists: number;
  involvement: number;
  avgGoals: number;
  avgAssists: number;
  avgInvolvement: number;
};

function fmt1(n: number): string {
  return n.toFixed(1);
}

function buildDateRange(season?: string, from?: string, to?: string) {
  if (season) return seasonToDateRange(season);
  if (from || to) {
    return {
      ...(from ? { gte: new Date(`${from}T00:00:00+09:00`) } : {}),
      ...(to ? { lt: new Date(`${to}T23:59:59+09:00`) } : {}),
    };
  }
  return undefined;
}

function RankingList({
  title,
  members,
  getValue,
  unit,
}: {
  title: string;
  members: MemberStat[];
  getValue: (m: MemberStat) => number;
  unit: string;
}) {
  const active = members.filter((m) => getValue(m) > 0);

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">{title}</h2>
      {active.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center text-gray-400 text-sm">
          記録がまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {(() => {
            let rank = 1;
            return active.map((m, idx) => {
              if (idx > 0 && getValue(m) < getValue(active[idx - 1])) rank = idx + 1;
              const value = getValue(m);
              const rankColor =
                rank === 1
                  ? "text-yellow-500"
                  : rank === 2
                    ? "text-gray-400"
                    : rank === 3
                      ? "text-amber-600"
                      : "text-gray-300";
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`text-sm font-bold w-5 shrink-0 text-center ${rankColor}`}>
                    {rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                    {m.uniformNumber ?? "—"}
                  </div>
                  <p className="flex-1 text-sm text-gray-800">{m.displayName}</p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {value}
                    {unit && (
                      <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
                    )}
                  </p>
                </div>
              );
            });
          })()}
        </div>
      )}
    </section>
  );
}

export default async function StatsPage({ params, searchParams }: Props) {
  const { teamId } = await params;
  const { level, season, from, to } = await searchParams;

  const dateRange = buildDateRange(season, from, to);

  // フィルター条件構築
  const levelFilter = level
    ? {
        OR: [
          { eventId: null as null, tournamentLevel: level },
          { eventId: { not: null as null }, event: { tournamentLevel: level } },
        ],
      }
    : undefined;

  const dateFilter = dateRange
    ? {
        OR: [
          { eventId: null as null, createdAt: dateRange },
          { eventId: { not: null as null }, event: { startDatetime: dateRange } },
        ],
      }
    : undefined;

  const matchWhere = {
    teamId,
    ...(levelFilter || dateFilter
      ? { AND: [...(levelFilter ? [levelFilter] : []), ...(dateFilter ? [dateFilter] : [])] }
      : {}),
  };

  const [members, matches, matchCounts, goalCounts, assistCounts, allEventDates, standaloneMatches] =
    await Promise.all([
      prisma.teamMember.findMany({
        where: { teamId, membershipStatus: { not: "left" } },
        orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
      }),
      prisma.match.findMany({
        where: matchWhere,
        select: { result: true, ourScore: true, opponentScore: true },
      }),
      prisma.matchPlayer.groupBy({
        by: ["teamMemberId"],
        where: { match: matchWhere },
        _count: { id: true },
      }),
      prisma.goal.groupBy({
        by: ["scorerId"],
        where: { goalType: "normal", scorerId: { not: null }, match: matchWhere },
        _count: { id: true },
      }),
      prisma.goal.groupBy({
        by: ["assistId"],
        where: { assistType: "member", assistId: { not: null }, match: matchWhere },
        _count: { id: true },
      }),
      // 年タブ用: イベントあり試合の年
      prisma.event.findMany({
        where: { teamId, matches: { some: {} } },
        select: { startDatetime: true },
      }),
      // 年タブ用: スタンドアロン試合の年
      prisma.match.findMany({
        where: { teamId, eventId: null },
        select: { createdAt: true },
      }),
    ]);

  // シーズン一覧を計算
  const seasonSet = new Set<string>();
  for (const e of allEventDates) seasonSet.add(dateToSeason(new Date(e.startDatetime)));
  for (const m of standaloneMatches) seasonSet.add(dateToSeason(new Date(m.createdAt)));
  const seasons = [...seasonSet].sort((a, b) => b.localeCompare(a));

  // チーム成績
  const totalMatches = matches.length;
  const wins = matches.filter((m) => m.result === "win").length;
  const draws = matches.filter((m) => m.result === "draw").length;
  const losses = matches.filter((m) => m.result === "loss").length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const totalScored = matches.reduce((sum, m) => sum + m.ourScore, 0);
  const totalConceded = matches.reduce((sum, m) => sum + m.opponentScore, 0);
  const goalDiff = totalScored - totalConceded;

  // 個人成績
  const matchCountMap = new Map(matchCounts.map((r) => [r.teamMemberId, r._count.id]));
  const goalCountMap = new Map(goalCounts.map((r) => [r.scorerId as string, r._count.id]));
  const assistCountMap = new Map(assistCounts.map((r) => [r.assistId as string, r._count.id]));

  const memberStats: MemberStat[] = members.map((m) => {
    const played = matchCountMap.get(m.id) ?? 0;
    const goals = goalCountMap.get(m.id) ?? 0;
    const assists = assistCountMap.get(m.id) ?? 0;
    const involvement = goals + assists;
    return {
      id: m.id,
      displayName: m.displayName,
      uniformNumber: m.uniformNumber,
      played,
      goals,
      assists,
      involvement,
      avgGoals: played > 0 ? goals / played : 0,
      avgAssists: played > 0 ? assists / played : 0,
      avgInvolvement: played > 0 ? involvement / played : 0,
    };
  });

  const byGoals = [...memberStats].sort(
    (a, b) => b.goals - a.goals || a.displayName.localeCompare(b.displayName),
  );
  const byAssists = [...memberStats].sort(
    (a, b) => b.assists - a.assists || a.displayName.localeCompare(b.displayName),
  );
  const byInvolvement = [...memberStats].sort(
    (a, b) => b.involvement - a.involvement || a.displayName.localeCompare(b.displayName),
  );
  const byPlayed = [...memberStats].sort(
    (a, b) => b.played - a.played || a.displayName.localeCompare(b.displayName),
  );
  const tableStats = [...memberStats].sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || a.displayName.localeCompare(b.displayName),
  );

  return (
    <div className="space-y-6">
      <StatsFilter
        seasons={seasons}
        currentSeason={season}
        currentLevel={level}
        currentFrom={from}
        currentTo={to}
      />

      {/* チーム成績 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">チーム成績</h2>
        {totalMatches === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            試合記録がまだありません
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-center min-w-[52px]">
                <p className="text-3xl font-bold text-gray-900">{totalMatches}</p>
                <p className="text-xs text-gray-500">試合</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-xl font-bold text-green-600">{wins}</p>
                  <p className="text-xs text-gray-500">勝</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-400">{draws}</p>
                  <p className="text-xs text-gray-500">分</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-500">{losses}</p>
                  <p className="text-xs text-gray-500">敗</p>
                </div>
              </div>
              <div className="text-center min-w-[56px]">
                <p className="text-3xl font-bold text-blue-600">{winRate}%</p>
                <p className="text-xs text-gray-500">勝率</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">{totalScored}</p>
                <p className="text-xs text-gray-500">総得点</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{totalConceded}</p>
                <p className="text-xs text-gray-500">総失点</p>
              </div>
              <div>
                <p
                  className={`text-lg font-semibold ${
                    goalDiff > 0
                      ? "text-green-600"
                      : goalDiff < 0
                        ? "text-red-500"
                        : "text-gray-900"
                  }`}
                >
                  {goalDiff > 0 ? "+" : ""}
                  {goalDiff}
                </p>
                <p className="text-xs text-gray-500">得失点差</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {fmt1(totalScored / totalMatches)}
                </p>
                <p className="text-xs text-gray-500">平均得点 / 試合</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {fmt1(totalConceded / totalMatches)}
                </p>
                <p className="text-xs text-gray-500">平均失点 / 試合</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <RankingList title="得点ランキング" members={byGoals} getValue={(m) => m.goals} unit="点" />
      <RankingList title="アシストランキング" members={byAssists} getValue={(m) => m.assists} unit="本" />
      <RankingList
        title="ゴール関与ランキング"
        members={byInvolvement}
        getValue={(m) => m.involvement}
        unit=""
      />
      <RankingList
        title="出場試合数ランキング"
        members={byPlayed}
        getValue={(m) => m.played}
        unit="試合"
      />

      {/* 個人成績 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">個人成績</h2>
        {tableStats.every((m) => m.played === 0) ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            出場記録がまだありません
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap sticky left-0 bg-gray-50">
                    メンバー
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                    出場
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                    得点
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                    アシスト
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                    関与
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                    平均得点
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                    平均関与
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableStats.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2.5 whitespace-nowrap sticky left-0 bg-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 w-6 shrink-0">
                          {m.uniformNumber != null ? `#${m.uniformNumber}` : ""}
                        </span>
                        <span className="text-gray-800">{m.displayName}</span>
                      </div>
                    </td>
                    <td className="text-right px-3 py-2.5 text-gray-700 tabular-nums">
                      {m.played}
                    </td>
                    <td className="text-right px-3 py-2.5 font-semibold text-gray-900 tabular-nums">
                      {m.goals}
                    </td>
                    <td className="text-right px-3 py-2.5 text-gray-700 tabular-nums">
                      {m.assists}
                    </td>
                    <td className="text-right px-3 py-2.5 text-gray-700 tabular-nums">
                      {m.involvement}
                    </td>
                    <td className="text-right px-3 py-2.5 text-gray-500 tabular-nums text-xs">
                      {m.played > 0 ? fmt1(m.avgGoals) : "—"}
                    </td>
                    <td className="text-right px-3 py-2.5 text-gray-500 tabular-nums text-xs">
                      {m.played > 0 ? fmt1(m.avgInvolvement) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
