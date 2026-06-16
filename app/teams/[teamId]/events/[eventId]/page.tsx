import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPE_LABEL } from "@/lib/constants";

type Props = { params: Promise<{ teamId: string; eventId: string }> };

const ATTENDANCE_LABEL: Record<string, string> = {
  attending: "参加",
  undecided: "未定",
  absent: "不参加",
};

const ATTENDANCE_COLOR: Record<string, string> = {
  attending: "text-green-600 font-bold",
  undecided: "text-yellow-500 font-bold",
  absent: "text-red-500 font-bold",
};

export default async function EventDetailPage({ params }: Props) {
  const { teamId, eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      attendances: { include: { teamMember: true } },
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
        <h2 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h2>

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
          {event.eventType && (
            <p className="text-gray-500">
              {EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}
            </p>
          )}
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
          {event.sourcePollId && (
            <Link
              href={`/teams/${teamId}/polls/${event.sourcePollId}`}
              className="block w-full text-center text-sm text-gray-500 hover:text-blue-600"
            >
              元の日程調整を見る
            </Link>
          )}
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
    </div>
  );
}
