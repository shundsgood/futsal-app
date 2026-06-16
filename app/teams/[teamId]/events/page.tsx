import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ teamId: string }> };

const EVENT_TYPE_LABEL: Record<string, string> = {
  practice: "練習",
  friendly: "練習試合",
  tournament: "大会",
  league: "リーグ戦",
  other: "その他",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "確定",
  cancelled: "中止",
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default async function EventsPage({ params }: Props) {
  const { teamId } = await params;

  const events = await prisma.event.findMany({
    where: { teamId },
    include: {
      _count: { select: { attendances: true } },
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
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      STATUS_COLOR[event.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_LABEL[event.status] ?? event.status}
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
                  {event.eventType && (
                    <span>{EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}</span>
                  )}
                  {event.venueName && <span>{event.venueName}</span>}
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
