"use client";

import { useState } from "react";
import { submitPollResponse } from "@/lib/actions/poll";

type Option = {
  id: string;
  startDatetime: Date;
  endDatetime: Date | null;
  venueName: string | null;
  note: string | null;
};

type Props = {
  pollId: string;
  teamId: string;
  options: Option[];
  initialResponses: Record<string, { responseType: string; comment: string | null }>;
};

const CHOICES = [
  { value: "available", label: "○", selected: "border-green-500 bg-green-50 text-green-600", unselected: "border-gray-200 text-gray-300" },
  { value: "maybe",     label: "△", selected: "border-yellow-400 bg-yellow-50 text-yellow-500", unselected: "border-gray-200 text-gray-300" },
  { value: "unavailable", label: "×", selected: "border-red-400 bg-red-50 text-red-500", unselected: "border-gray-200 text-gray-300" },
] as const;

function formatDatetime(dt: Date) {
  return new Date(dt).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dt: Date) {
  return new Date(dt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RespondForm({ pollId, teamId, options, initialResponses }: Props) {
  const [responses, setResponses] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(initialResponses).map(([id, r]) => [id, r.responseType]),
    ),
  );
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(initialResponses).map(([id, r]) => [id, r.comment ?? ""]),
    ),
  );

  const action = submitPollResponse.bind(null, pollId, teamId);

  return (
    <form action={action} className="space-y-3">
      {options.map((opt, idx) => (
        <div key={opt.id} className="bg-white rounded-xl border border-gray-200 p-4">
          {/* 候補ヘッダ */}
          <p className="text-xs font-semibold text-gray-400 mb-1">候補 {idx + 1}</p>
          <p className="font-medium text-gray-900">
            {formatDatetime(opt.startDatetime)}
            {opt.endDatetime && (
              <span className="text-gray-400 text-sm"> 〜 {formatTime(opt.endDatetime)}</span>
            )}
          </p>
          {opt.venueName && (
            <p className="text-xs text-gray-500 mt-0.5">{opt.venueName}</p>
          )}

          {/* ○△× ボタン */}
          <div className="flex gap-2 mt-3">
            {CHOICES.map(({ value, label, selected, unselected }) => {
              const isSelected = responses[opt.id] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setResponses((prev) => ({ ...prev, [opt.id]: value }))
                  }
                  className={`flex-1 py-2 rounded-lg border-2 font-bold text-xl transition ${
                    isSelected ? selected : unselected
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* hidden input でフォームに値を渡す */}
          {responses[opt.id] && (
            <input type="hidden" name={`response_${opt.id}`} value={responses[opt.id]} />
          )}

          {/* コメント */}
          <input
            name={`comment_${opt.id}`}
            type="text"
            value={comments[opt.id] ?? ""}
            onChange={(e) =>
              setComments((prev) => ({ ...prev, [opt.id]: e.target.value }))
            }
            placeholder="コメント（任意）"
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
      >
        回答を送信する
      </button>
    </form>
  );
}
