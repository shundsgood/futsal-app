import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AttendForm } from "./AttendForm";

type Props = { params: Promise<{ teamId: string; eventId: string }> };

export default async function AttendPage({ params }: Props) {
  const { teamId, eventId } = await params;
  const user = await getCurrentUser();

  const [event, member] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.teamMember.findFirst({ where: { teamId, userId: user.id } }),
  ]);

  if (!event || event.teamId !== teamId) notFound();

  const existing = member
    ? await prisma.eventAttendance.findUnique({
        where: { eventId_teamMemberId: { eventId, teamMemberId: member.id } },
      })
    : null;

  return (
    <div>
      <Link href={`/teams/${teamId}/events/${eventId}`} className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">← イベントに戻る</Link>
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">{event.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {member?.displayName ?? user.displayName} として回答
      </p>

      <AttendForm
        eventId={eventId}
        teamId={teamId}
        initialStatus={existing?.status ?? "undecided"}
        initialComment={existing?.comment ?? ""}
      />
    </div>
  );
}
