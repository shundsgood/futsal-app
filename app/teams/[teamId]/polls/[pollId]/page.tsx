import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { reopenPoll } from "@/lib/actions/poll";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { EVENT_TYPE_LABEL, POLL_RESPONSE_LABEL, POLL_RESPONSE_COLOR } from "@/lib/constants";
import { PollOptionsSection } from "./_components/PollOptionsSection";
import { CopyInviteLinkButton } from "../../settings/_components/CopyInviteLinkButton";

type Props = { params: Promise<{ teamId: string; pollId: string }> };

const STATUS_LABEL: Record<string, string> = {
  open: "回答受付中",
  closed: "回答締切",
  confirmed: "確定済み",
  cancelled: "中止",
};

const STATUS_COLOR: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-600",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};


export default async function PollDetailPage({ params }: Props) {
  const { teamId, pollId } = await params;

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;
  const shareUrl = `${baseUrl}/teams/${teamId}/polls/${pollId}`;

  const [poll, allMembers] = await unstable_cache(
    async () => Promise.all([
      prisma.schedulePoll.findUnique({
        where: { id: pollId },
        include: {
          options: {
            orderBy: { startDatetime: "asc" },
            include: { responses: { include: { teamMember: true } } },
          },
        },
      }),
      prisma.teamMember.findMany({
        where: { teamId, membershipStatus: { not: "left" } },
        orderBy: [{ uniformNumber: "asc" }, { displayName: "asc" }],
      }),
    ]),
    [`poll-detail-${pollId}`],
    { tags: [`team-${teamId}`] },
  )();

  if (!poll || poll.teamId !== teamId) notFound();

  const activeMemberIds = new Set(allMembers.map((m) => m.id));

  return (
    <div className="space-y-5">
      {/* 概要 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-bold text-gray-900">{poll.title}</h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
              STATUS_COLOR[poll.status] ?? "bg-gray-100 text-gray-500"
            }`}
          >
            {STATUS_LABEL[poll.status] ?? poll.status}
          </span>
        </div>
        {poll.eventType && (
          <p className="text-sm text-gray-500">
            種別: {EVENT_TYPE_LABEL[poll.eventType] ?? poll.eventType}
          </p>
        )}
        {poll.description && (
          <p className="text-sm text-gray-600 mt-1">{poll.description}</p>
        )}
        {poll.responseDeadline && (
          <p className="text-sm text-gray-500 mt-1">
            回答期限:{" "}
            {new Date(poll.responseDeadline).toLocaleString("ja-JP", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Tokyo",
            })}
          </p>
        )}

        {poll.status !== "cancelled" && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            {poll.status === "open" && (
              <Link
                href={`/teams/${teamId}/polls/${pollId}/respond`}
                className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition"
              >
                回答する
              </Link>
            )}
            <Link
              href={`/teams/${teamId}/polls/${pollId}/edit`}
              className="block w-full text-center border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
            >
              編集
            </Link>
            {poll.status === "confirmed" && (
              <form action={reopenPoll.bind(null, pollId, teamId)}>
                <SubmitButton label="回答受付中に戻す" />
              </form>
            )}
          </div>
        )}
      </div>

      {/* 共有リンク */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-2">回答リンクを共有</p>
        <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 break-all mb-2 font-mono">
          {shareUrl}
        </p>
        <CopyInviteLinkButton url={shareUrl} />
      </div>

      {/* 候補日ごとの集計 */}
      <PollOptionsSection
        pollId={pollId}
        teamId={teamId}
        pollStatus={poll.status}
        options={poll.options.map((opt) => {
          const counts = { available: 0, maybe: 0, unavailable: 0 };
          for (const r of opt.responses) {
            if (!activeMemberIds.has(r.teamMemberId)) continue;
            if (r.responseType in counts)
              counts[r.responseType as keyof typeof counts]++;
          }
          const unanswered = allMembers.length - counts.available - counts.maybe - counts.unavailable;
          return {
            id: opt.id,
            startDatetime: opt.startDatetime,
            endDatetime: opt.endDatetime,
            venueName: opt.venueName,
            counts: { ...counts, unanswered },
          };
        })}
      />

      {/* メンバー×候補日マトリクス */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">回答マトリクス</h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                  メンバー
                </th>
                {poll.options.map((opt, idx) => (
                  <th
                    key={opt.id}
                    className="text-center px-3 py-2 font-medium text-gray-600 whitespace-nowrap min-w-[60px]"
                  >
                    候補{idx + 1}
                    <br />
                    <span className="text-xs font-normal text-gray-400">
                      {new Date(opt.startDatetime).toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        timeZone: "Asia/Tokyo",
                      })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-2 text-gray-800 whitespace-nowrap">
                    <span className="text-xs text-gray-400 mr-1">
                      {member.uniformNumber != null ? `#${member.uniformNumber}` : ""}
                    </span>
                    {member.displayName}
                  </td>
                  {poll.options.map((opt) => {
                    const response = opt.responses.find(
                      (r) => r.teamMemberId === member.id,
                    );
                    return (
                      <td key={opt.id} className="text-center px-3 py-2">
                        {response ? (
                          <span
                            className={POLL_RESPONSE_COLOR[response.responseType] ?? "text-gray-400"}
                            title={response.comment ?? undefined}
                          >
                            {POLL_RESPONSE_LABEL[response.responseType] ?? "?"}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
