import Link from "next/link";
import { createEvent } from "@/lib/actions/event";
import { SubmitButton } from "@/app/_components/SubmitButton";

type Props = { params: Promise<{ teamId: string }> };

const EVENT_TYPES = [
  { value: "", label: "種別を選択" },
  { value: "tournament", label: "大会" },
  { value: "league", label: "リーグ戦" },
  { value: "practice", label: "練習" },
  { value: "friendly", label: "練習試合" },
  { value: "other", label: "その他" },
];

export default async function NewEventPage({ params }: Props) {
  const { teamId } = await params;
  const action = createEvent.bind(null, teamId);

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/teams/${teamId}/events`} className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block">← 活動一覧に戻る</Link>
        <h2 className="text-lg font-bold text-gray-900">活動を作成</h2>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：6月練習"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 開始・終了日時 */}
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：○○フットサルコート"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SubmitButton label="作成する" />
        </form>
      </div>
    </div>
  );
}
