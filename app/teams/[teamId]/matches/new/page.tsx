import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchForm } from "../../events/[eventId]/matches/new/MatchForm";
import { EVENT_TYPE_LABEL } from "@/lib/constants";

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ eventId?: string }>;
};

export default async function NewMatchFromListPage({ params, searchParams }: Props) {
  const { teamId } = await params;
  const { eventId } = await searchParams;

  // Step 2: event selected — show full match form
  if (eventId) {
    const [event, matchCount, attendances, allMembers] = await Promise.all([
      prisma.event.findFirst({ where: { id: eventId, teamId } }),
      prisma.match.count({ where: { eventId } }),
      prisma.eventAttendance.findMany({
        where: { eventId },
        select: { teamMemberId: true, status: true },
      }),
      prisma.teamMember.findMany({
        where: { teamId, membershipStatus: { not: "left" } },
        orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
      }),
    ]);

    if (!event) notFound();

    const attendingIds = new Set(
      attendances.filter((a) => a.status === "attending").map((a) => a.teamMemberId),
    );

    const members = allMembers.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      uniformNumber: m.uniformNumber,
      isAttending: attendingIds.has(m.id),
    }));

    return (
      <div className="space-y-5">
        <div>
          <Link
            href={`/teams/${teamId}/matches/new`}
            className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block"
          >
            ← 活動を選び直す
          </Link>
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">試合を追加</h2>
          <p className="text-sm text-gray-500">{event.title}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <MatchForm
            eventId={eventId}
            teamId={teamId}
            defaultMatchOrder={matchCount + 1}
            members={members}
            returnTo={`/teams/${teamId}/matches`}
          />
        </div>
      </div>
    );
  }

  // Step 1: no event selected — show event selector
  const events = await prisma.event.findMany({
    where: { teamId, status: "confirmed" },
    orderBy: { startDatetime: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/teams/${teamId}/matches`}
          className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block"
        >
          ← 試合一覧に戻る
        </Link>
        <h2 className="text-lg font-bold text-gray-900">活動を選択</h2>
        <p className="text-sm text-gray-500 mt-0.5">試合を追加する活動を選んでください</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          活動がありません
          <p className="text-xs mt-2">
            <Link href={`/teams/${teamId}/events/new`} className="text-blue-500 hover:underline">
              活動を作成する
            </Link>
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/teams/${teamId}/matches/new?eventId=${event.id}`}
                className="block bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-blue-400 hover:shadow-sm transition"
              >
                <p className="font-medium text-gray-900">{event.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>
                    {new Date(event.startDatetime).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </span>
                  {event.eventType && (
                    <span>{EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}</span>
                  )}
                  {event.venueName && <span>{event.venueName}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
