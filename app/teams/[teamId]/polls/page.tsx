import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PollList } from "./_components/PollList";

type Props = { params: Promise<{ teamId: string }> };

export default async function PollsPage({ params }: Props) {
  const { teamId } = await params;

  const polls = await unstable_cache(
    async () => prisma.schedulePoll.findMany({
      where: { teamId },
      include: {
        options: { orderBy: { startDatetime: "asc" }, take: 1 },
        _count: { select: { options: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    [`polls-${teamId}`],
    { tags: [`team-${teamId}`] },
  )();

  return <PollList teamId={teamId} polls={polls} />;
}
