"use client";

import { useRef, useState } from "react";
import { createPoll } from "@/lib/actions/poll";

type Option = { id: number };

const EVENT_TYPES = [
  { value: "", label: "種別を選択" },
  { value: "practice", label: "練習" },
  { value: "friendly", label: "練習試合" },
  { value: "tournament", label: "大会" },
  { value: "league", label: "リーグ戦" },
  { value: "other", label: "その他" },
];

export function PollForm({ teamId }: { teamId: string }) {
  const [options, setOptions] = useState<Option[]>([{ id: 0 }]);
  const nextId = useRef(1);

  const addOption = () =>
    setOptions((prev) => [...prev, { id: nextId.current++ }]);

  const removeOption = (id: number) =>
    setOptions((prev) => prev.filter((o) => o.id !== id));

  const action = createPoll.bind(null, teamId);

  return (
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
          placeholder="例：6月の練習日程"
        />
      </div>

      {/* イベント種別 */}
      <div>
        <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
          イベント種別
        </label>
        <select
          id="eventType"
          name="eventType"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* 説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明・備考
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 回答期限 */}
      <div>
        <label htmlFor="responseDeadline" className="block text-sm font-medium text-gray-700 mb-1">
          回答期限
        </label>
        <input
          id="responseDeadline"
          name="responseDeadline"
          type="datetime-local"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 候補日時 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            候補日時 <span className="text-red-500">*</span>
          </p>
          <button
            type="button"
            onClick={addOption}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            + 候補を追加
          </button>
        </div>

        <div className="space-y-4">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative"
            >
              <p className="text-xs font-semibold text-gray-500 mb-3">候補 {idx + 1}</p>

              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(opt.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                  aria-label="削除"
                >
                  ×
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    開始日時 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name={`startDatetime_${idx}`}
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">終了日時</label>
                  <input
                    name={`endDatetime_${idx}`}
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">会場</label>
                <input
                  name={`venueName_${idx}`}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：○○フットサルコート"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">補足</label>
                <input
                  name={`note_${idx}`}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition"
      >
        作成する
      </button>
    </form>
  );
}
