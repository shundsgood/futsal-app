"use client";

import { useState } from "react";
import { submitEventAttendance } from "@/lib/actions/event";

type Props = {
  eventId: string;
  teamId: string;
  initialStatus: string;
  initialComment: string;
};

const CHOICES = [
  {
    value: "attending",
    label: "参加",
    selected: "border-green-500 bg-green-50 text-green-600",
    unselected: "border-gray-200 text-gray-400",
  },
  {
    value: "undecided",
    label: "未定",
    selected: "border-yellow-400 bg-yellow-50 text-yellow-500",
    unselected: "border-gray-200 text-gray-400",
  },
  {
    value: "absent",
    label: "不参加",
    selected: "border-red-400 bg-red-50 text-red-500",
    unselected: "border-gray-200 text-gray-400",
  },
] as const;

export function AttendForm({ eventId, teamId, initialStatus, initialComment }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [comment, setComment] = useState(initialComment);

  const action = submitEventAttendance.bind(null, eventId, teamId);

  return (
    <form action={action} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">出欠を選択</p>
          <div className="flex gap-2">
            {CHOICES.map(({ value, label, selected, unselected }) => {
              const isSelected = status === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition ${
                    isSelected ? selected : unselected
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="status" value={status} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コメント（任意）
          </label>
          <input
            name="comment"
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="一言メモ"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
      >
        保存する
      </button>
    </form>
  );
}
