import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPE_LABEL, EVENT_TYPE_COLOR, MATCH_RESULT_LABEL, MATCH_RESULT_COLOR, GOAL_TYPE_LABEL, ATTENDANCE_LABEL, ATTENDANCE_COLOR } from "@/lib/constants";
import { DeleteEventButton } from "./DeleteEventButton";

type Props = { params: Promise<{ teamId: string; eventId: string }> };


export default async function EventDetailPage({ params }: Props) {
  const { teamId, eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      attendances: { include: { teamMember: true } },
      matches: {
        include: {
          players: true,
          goals: { include: { scorer: true }, orderBy: { goalOrder: "asc" } },
        },
        orderBy: { matchOrder: "asc" },
      },
    },
  });

  if (!event || event.teamId !== teamId) notFound();

  const allMembers = await prisma.teamMember.findMany({
    where: { teamId, membershipStatus: { not: "left" } },
    orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
  });

  const counts = { attending: 0, undecided: 0, absent: 0 };
  const attendanceMap = new Map(
    event.attendances.map((a) => [a.teamMemberId, a]),
  );
  for (const a of event.attendances) {
    if (a.status in counts) counts[a.status as keyof typeof counts]++;
  }

  return (
    <div className="space-y-5">
      {/* 概要 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
          {event.eventType && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                EVENT_TYPE_COLOR[event.eventType] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}
            </span>
          )}
        </div>

        {event.finalRank && (
          <p className="text-sm font-bold text-blue-700 mb-2">{event.finalRank}</p>
        )}

        <div className="space-y-1 text-sm text-gray-600">
          <p>
            {new Date(event.startDatetime).toLocaleString("ja-JP", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {event.endDatetime && (
              <span className="text-gray-400">
                {" "}〜{" "}
                {new Date(event.endDatetime).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </p>
          {event.venueName && <p>{event.venueName}</p>}
          {event.description && <p className="text-gray-500">{event.description}</p>}
          {event.note && <p className="text-gray-500">{event.note}</p>}
        </div>

        <div className="mt-4 flex gap-4 text-sm font-medium">
          <span className="text-green-600">参加 {counts.attending}</span>
          <span className="text-yellow-500">未定 {counts.undecided}</span>
          <span className="text-red-500">不参加 {counts.absent}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <Link
            href={`/teams/${teamId}/events/${eventId}/attend`}
            className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            出欠を変更する
          </Link>
          <Link
            href={`/teams/${teamId}/events/${eventId}/edit`}
            className="block w-full text-center border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
          >
            イベントを編集
          </Link>
          {event.sourcePollId && (
            <Link
              href={`/teams/${teamId}/polls/${event.sourcePollId}`}
              className="block w-full text-center text-sm text-gray-500 hover:text-blue-600"
            >
              元の日程調整を見る
            </Link>
          )}
          <DeleteEventButton eventId={eventId} teamId={teamId} />
        </div>
      </div>

      {/* 出欠一覧 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">出欠一覧</h3>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {allMembers.map((member) => {
            const attendance = attendanceMap.get(member.id);
            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                  {member.uniformNumber ?? "—"}
                </div>
                <p className="flex-1 text-sm text-gray-800">{member.displayName}</p>
                <span
                  className={`text-sm ${
                    attendance
                      ? (ATTENDANCE_COLOR[attendance.status] ?? "text-gray-400")
                      : "text-gray-300"
                  }`}
                  title={attendance?.comment ?? undefined}
                >
                  {attendance
                    ? (ATTENDANCE_LABEL[attendance.status] ?? attendance.status)
                    : "未回答"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 試合結果 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">試合結果</h3>
          <Link
            href={`/teams/${teamId}/events/${eventId}/matches/new`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + 追加
          </Link>
        </div>

        {event.matches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            試合結果がまだありません
          </div>
        ) : (
          <div className="space-y-2">
            {event.matches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400 font-medium">第{match.matchOrder}試合</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        MATCH_RESULT_COLOR[match.result] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {MATCH_RESULT_LABEL[match.result] ?? match.result}
                    </span>
                    {match.goals.length !== match.ourScore && (
                      <span title="得点記録数とスコアが一致していません" className="text-amber-500 text-xs">⚠️</span>
                    )}
                    <Link
                      href={`/teams/${teamId}/events/${eventId}/matches/${match.id}/edit`}
                      className="text-xs text-gray-400 hover:text-blue-600"
                    >
                      編集
                    </Link>
                  </div>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {match.ourScore} - {match.opponentScore}
                  </span>
                  <span className="text-sm text-gray-500">vs {match.opponentName}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span>出場 {match.players.length}名</span>
                  {match.goals.length > 0 && (
                    <span className="truncate">
                      {match.goals
                        .map((g) =>
                          g.goalType === "normal"
                            ? (g.scorer?.displayName ?? "—")
                            : GOAL_TYPE_LABEL[g.goalType] ?? g.goalType,
                        )
                        .join(", ")}
                    </span>
                  )}
                </div>
                {match.matchUrl && (
                  <a
                    href={match.matchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs text-blue-500 hover:underline truncate"
                  >
                    {match.matchUrl}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
