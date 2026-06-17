import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPE_LABEL, EVENT_TYPE_COLOR } from "@/lib/constants";

type Props = { params: Promise<{ teamId: string }> };

function getStatusLabel(status: string, startDatetime: Date): string {
  if (status === "cancelled") return "中止";
  return new Date() < startDatetime ? "開催前" : "完了";
}

function getStatusColor(status: string, startDatetime: Date): string {
  if (status === "cancelled") return "bg-red-100 text-red-600";
  return new Date() < startDatetime ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500";
}

export default async function EventsPage({ params }: Props) {
  const { teamId } = await params;

  const events = await prisma.event.findMany({
    where: { teamId },
    include: {
      attendances: { where: { status: "attending" } },
    },
    orderBy: { startDatetime: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">イベント一覧</h2>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          イベントがありません
          <p className="text-xs mt-2 text-gray-400">日程調整で候補日を確定するとここに表示されます</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/teams/${teamId}/events/${event.id}`}
                className="block bg-white rounded-xl border border-gray-200 px-4 py-4 hover:border-blue-400 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <p className="font-semibold text-gray-900">{event.title}</p>
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
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(event.status, event.startDatetime)}`}
                  >
                    {getStatusLabel(event.status, event.startDatetime)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>
                    {new Date(event.startDatetime).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {event.venueName && <span>{event.venueName}</span>}
                  {event.finalRank && (
                    <span className="font-medium text-blue-600">{event.finalRank}</span>
                  )}
                  <span className="text-green-600 font-medium">
                    参加 {event.attendances.length}人
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
