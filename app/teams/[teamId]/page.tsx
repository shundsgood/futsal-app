import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ teamId: string }> };

export default async function TeamDashboardPage({ params }: Props) {
  const { teamId } = await params;

  const [memberCount, openPollCount, upcomingEventCount] = await unstable_cache(
    async () => {
      const now = new Date();
      return Promise.all([
        prisma.teamMember.count({ where: { teamId, membershipStatus: "active" } }),
        prisma.schedulePoll.count({ where: { teamId, status: "open" } }),
        prisma.event.count({
          where: { teamId, status: "confirmed", startDatetime: { gte: now } },
        }),
      ]);
    },
    [`dashboard-${teamId}`],
    { tags: [`team-${teamId}`], revalidate: 3600 },
  )();

  const cards = [
    {
      href: `/teams/${teamId}/members`,
      title: "メンバー",
      value: `${memberCount}人`,
      action: "一覧を見る →",
    },
    {
      href: `/teams/${teamId}/polls`,
      title: "日程調整",
      value: `回答受付中 ${openPollCount}件`,
      action: "一覧を見る →",
    },
    {
      href: `/teams/${teamId}/events`,
      title: "イベント",
      value: `直近 ${upcomingEventCount}件`,
      action: "一覧を見る →",
    },
  ];

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="block bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-400 hover:shadow-sm transition"
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            {card.title}
          </p>
          <p className="text-lg font-semibold text-gray-900">{card.value}</p>
          <p className="text-sm text-blue-600 mt-1">{card.action}</p>
        </Link>
      ))}
    </div>
  );
}
