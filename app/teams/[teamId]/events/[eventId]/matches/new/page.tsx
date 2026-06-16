import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchForm } from "./MatchForm";

type Props = { params: Promise<{ teamId: string; eventId: string }> };

export default async function NewMatchPage({ params }: Props) {
  const { teamId, eventId } = await params;

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
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">試合結果を追加</h2>
      <p className="text-sm text-gray-500 mb-4">{event.title}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <MatchForm
          eventId={eventId}
          teamId={teamId}
          defaultMatchOrder={matchCount + 1}
          members={members}
        />
      </div>
    </div>
  );
}
