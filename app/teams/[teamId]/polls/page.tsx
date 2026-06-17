import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ teamId: string }> };

const STATUS_LABEL: Record<string, string> = {
  open: "回答受付中",
  confirmed: "確定済み",
  cancelled: "中止",
};

const STATUS_COLOR: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default async function PollsPage({ params }: Props) {
  const { teamId } = await params;

  const polls = await prisma.schedulePoll.findMany({
    where: { teamId },
    include: {
      options: { orderBy: { startDatetime: "asc" }, take: 1 },
      _count: { select: { options: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">日程調整一覧</h2>
        <Link
          href={`/teams/${teamId}/polls/new`}
          className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          + 作成
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          日程調整がありません
        </div>
      ) : (
        <ul className="space-y-3">
          {polls.map((poll) => {
            const earliest = poll.options[0];
            return (
              <li key={poll.id}>
                <Link
                  href={`/teams/${teamId}/polls/${poll.id}`}
                  className="block bg-white rounded-xl border border-gray-200 px-4 py-4 hover:border-blue-400 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{poll.title}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        STATUS_COLOR[poll.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABEL[poll.status] ?? poll.status}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                    <span>候補日 {poll._count.options}件</span>
                    {earliest && (
                      <span>
                        最初:{" "}
                        {new Date(earliest.startDatetime).toLocaleDateString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {poll.responseDeadline && (
                      <span>
                        締切:{" "}
                        {new Date(poll.responseDeadline).toLocaleDateString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
