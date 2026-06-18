import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePollInfo } from "@/lib/actions/poll";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { PollEditForm } from "./PollEditForm";
import { toDatetimeLocal, toDateLocal } from "@/lib/utils";

type Props = { params: Promise<{ teamId: string; pollId: string }> };

const EVENT_TYPES = [
  { value: "", label: "種別を選択" },
  { value: "practice", label: "練習" },
  { value: "friendly", label: "練習試合" },
  { value: "tournament", label: "大会" },
  { value: "league", label: "リーグ戦" },
  { value: "other", label: "その他" },
];

export default async function EditPollPage({ params }: Props) {
  const { teamId, pollId } = await params;

  const poll = await prisma.schedulePoll.findFirst({
    where: { id: pollId, teamId },
    include: { options: { orderBy: { startDatetime: "asc" } } },
  });

  if (!poll) notFound();

  const action = updatePollInfo.bind(null, pollId, teamId);

  const initialOptions = poll.options.map((opt) => {
    const d = opt.startDatetime;
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || !!opt.endDatetime;
    return {
      existingId: opt.id,
      hasTime,
      startDatetime: hasTime ? toDatetimeLocal(opt.startDatetime) : toDateLocal(opt.startDatetime),
      endDatetime: opt.endDatetime ? toDatetimeLocal(opt.endDatetime) : "",
      venueName: opt.venueName ?? "",
      note: opt.note ?? "",
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/teams/${teamId}/polls/${pollId}`} className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block">← 日程調整に戻る</Link>
        <h2 className="text-lg font-bold text-gray-900">日程調整を編集</h2>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">基本情報</h3>
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={poll.title}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              イベント種別
            </label>
            <select
              id="eventType"
              name="eventType"
              defaultValue={poll.eventType ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明・備考
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={poll.description ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="responseDeadline" className="block text-sm font-medium text-gray-700 mb-1">
              回答期限
            </label>
            <input
              id="responseDeadline"
              name="responseDeadline"
              type="datetime-local"
              defaultValue={poll.responseDeadline ? toDatetimeLocal(poll.responseDeadline) : ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SubmitButton label="基本情報を保存" />
        </form>
      </div>

      {/* 候補日（確定済みは編集不可） */}
      {poll.status !== "confirmed" ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">候補日</h3>
          <PollEditForm pollId={pollId} teamId={teamId} initialOptions={initialOptions} />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500">
          確定済みのため候補日は編集できません
        </div>
      )}
    </div>
  );
}
