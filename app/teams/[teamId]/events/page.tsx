import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EventList } from "./_components/EventList";

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ status?: string }>;
};

const TABS = [
  { label: "すべて", value: undefined },
  { label: "開催前", value: "upcoming" },
  { label: "完了", value: "past" },
];

export default async function EventsPage({ params, searchParams }: Props) {
  const { teamId } = await params;
  const { status } = await searchParams;

  const now = new Date();
  const timingFilter =
    status === "upcoming"
      ? { startDatetime: { gt: now } }
      : status === "past"
        ? { startDatetime: { lte: now } }
        : undefined;

  const events = await prisma.event.findMany({
    where: { teamId, ...timingFilter },
    include: { attendances: { where: { status: "attending" } } },
    orderBy: { startDatetime: "desc" },
  });

  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {TABS.map((tab) => {
          const active = (status ?? undefined) === tab.value;
          const href = tab.value
            ? `/teams/${teamId}/events?status=${tab.value}`
            : `/teams/${teamId}/events`;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <EventList teamId={teamId} events={events} />
    </div>
  );
}
