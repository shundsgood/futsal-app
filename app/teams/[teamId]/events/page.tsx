import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EventList } from "./_components/EventList";

type Props = { params: Promise<{ teamId: string }> };

export default async function EventsPage({ params }: Props) {
  const { teamId } = await params;

  const events = await unstable_cache(
    async () => prisma.event.findMany({
      where: { teamId },
      include: { attendances: { where: { status: "attending" } } },
      orderBy: { startDatetime: "desc" },
    }),
    [`events-${teamId}`],
    { tags: [`team-${teamId}`] },
  )();

  return <EventList teamId={teamId} events={events} />;
}
