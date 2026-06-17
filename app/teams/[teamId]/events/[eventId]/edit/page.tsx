import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEvent } from "@/lib/actions/event";
import { EVENT_TYPE_LABEL } from "@/lib/constants";
import { toDatetimeLocal } from "@/lib/utils";

type Props = { params: Promise<{ teamId: string; eventId: string }> };

const EVENT_TYPES = [
  { value: "", label: "種別を選択" },
  { value: "tournament", label: "大会" },
  { value: "league", label: "リーグ戦" },
  { value: "practice", label: "練習" },
  { value: "friendly", label: "練習試合" },
  { value: "other", label: "その他" },
];


export default async function EditEventPage({ params }: Props) {
  const { teamId, eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.teamId !== teamId) notFound();

  const action = updateEvent.bind(null, eventId, teamId);

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/teams/${teamId}/events/${eventId}`} className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block">← イベントに戻る</Link>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">イベントを編集</h2>
        <p className="text-sm text-gray-500">{event.title}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <form action={action} className="space-y-5">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={event.title}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 種別 */}
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              種別
            </label>
            <select
              id="eventType"
              name="eventType"
              defaultValue={event.eventType ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 順位 */}
          <div>
            <label htmlFor="finalRank" className="block text-sm font-medium text-gray-700 mb-1">
              最終順位
            </label>
            <select
              id="finalRank"
              name="finalRank"
              defaultValue={event.finalRank ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">未設定</option>
              <option value="優勝">優勝</option>
              <option value="準優勝">準優勝</option>
              <option value="3位">3位</option>
              <option value="それ以外">それ以外</option>
            </select>
          </div>

          {/* 開始日時 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDatetime" className="block text-sm font-medium text-gray-700 mb-1">
                開始日時 <span className="text-red-500">*</span>
              </label>
              <input
                id="startDatetime"
                name="startDatetime"
                type="datetime-local"
                required
                defaultValue={toDatetimeLocal(event.startDatetime)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDatetime" className="block text-sm font-medium text-gray-700 mb-1">
                終了日時
              </label>
              <input
                id="endDatetime"
                name="endDatetime"
                type="datetime-local"
                defaultValue={event.endDatetime ? toDatetimeLocal(event.endDatetime) : ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 会場 */}
          <div>
            <label htmlFor="venueName" className="block text-sm font-medium text-gray-700 mb-1">
              会場
            </label>
            <input
              id="venueName"
              name="venueName"
              type="text"
              defaultValue={event.venueName ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={event.description ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 備考 */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              id="note"
              name="note"
              rows={2}
              defaultValue={event.note ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
          >
            保存する
          </button>
        </form>
      </div>
    </div>
  );
}
