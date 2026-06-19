import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PollList } from "./_components/PollList";

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ status?: string }>;
};

const TABS = [
  { label: "すべて", value: undefined },
  { label: "受付中", value: "open" },
  { label: "完了", value: "done" },
];

export default async function PollsPage({ params, searchParams }: Props) {
  const { teamId } = await params;
  const { status } = await searchParams;

  const statusFilter =
    status === "open"
      ? { status: "open" }
      : status === "done"
        ? { status: { not: "open" } }
        : undefined;

  const polls = await prisma.schedulePoll.findMany({
    where: { teamId, ...statusFilter },
    include: {
      options: { orderBy: { startDatetime: "asc" }, take: 1 },
      _count: { select: { options: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {TABS.map((tab) => {
          const active = (status ?? undefined) === tab.value;
          const href = tab.value
            ? `/teams/${teamId}/polls?status=${tab.value}`
            : `/teams/${teamId}/polls`;
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
      <PollList teamId={teamId} polls={polls} />
    </div>
  );
}
