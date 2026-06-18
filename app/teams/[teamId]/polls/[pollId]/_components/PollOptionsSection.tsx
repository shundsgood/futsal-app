"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPoll, confirmPollOptions } from "@/lib/actions/event";
import { SubmitButton } from "@/app/_components/SubmitButton";

type OptionData = {
  id: string;
  startDatetime: Date;
  endDatetime: Date | null;
  venueName: string | null;
  counts: {
    available: number;
    maybe: number;
    unavailable: number;
    unanswered: number;
  };
};

type Props = {
  pollId: string;
  teamId: string;
  pollStatus: string;
  options: OptionData[];
};

function formatDatetime(start: Date, end: Date | null): React.ReactNode {
  const isDateOnly = start.getHours() === 0 && start.getMinutes() === 0 && !end;
  const startStr = isDateOnly
    ? start.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" })
    : start.toLocaleString("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {startStr}
      {end && (
        <span className="text-gray-500">
          {" "}〜{" "}
          {end.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </>
  );
}

export function PollOptionsSection({ pollId, teamId, pollStatus, options }: Props) {
  const router = useRouter();
  const [multiMode, setMultiMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleMultiModeToggle = () => {
    setMultiMode((v) => !v);
    setSelected(new Set());
    setError(null);
  };

  const handleMultiConfirm = async () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した ${selected.size} 件の日程を確定しますか？`)) return;
    setPending(true);
    setError(null);
    const result = await confirmPollOptions(pollId, Array.from(selected), teamId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push(`/teams/${teamId}/events`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">集計サマリー</h3>
        {pollStatus === "open" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-500">複数日程を確定する</span>
            <button
              type="button"
              role="switch"
              aria-checked={multiMode}
              onClick={handleMultiModeToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                multiMode ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  multiMode ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        )}
      </div>

      {multiMode && pollStatus === "open" && (
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleMultiConfirm}
            disabled={pending || selected.size === 0}
            className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg disabled:opacity-40 transition"
          >
            {pending ? "確定中..." : `選択した ${selected.size} 件を確定`}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      <div className="space-y-3">
        {options.map((opt, idx) => {
          const isSelected = selected.has(opt.id);
          return (
            <div
              key={opt.id}
              onClick={multiMode && pollStatus === "open" ? () => toggleSelect(opt.id) : undefined}
              className={`bg-white rounded-xl border p-4 transition ${
                multiMode && pollStatus === "open"
                  ? isSelected
                    ? "border-green-400 bg-green-50 cursor-pointer"
                    : "border-gray-200 cursor-pointer hover:border-gray-300"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {multiMode && pollStatus === "open" && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(opt.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 h-4 w-4 accent-green-500 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 mb-1">候補 {idx + 1}</p>
                  <p className="font-medium text-gray-900">
                    {formatDatetime(new Date(opt.startDatetime), opt.endDatetime ? new Date(opt.endDatetime) : null)}
                  </p>
                  {opt.venueName && (
                    <p className="text-xs text-gray-500 mt-0.5">{opt.venueName}</p>
                  )}
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-green-600 font-bold">○ {opt.counts.available}</span>
                    <span className="text-yellow-500 font-bold">△ {opt.counts.maybe}</span>
                    <span className="text-red-500 font-bold">× {opt.counts.unavailable}</span>
                    <span className="text-gray-400">未 {opt.counts.unanswered}</span>
                  </div>
                  {!multiMode && pollStatus === "open" && (
                    <form action={confirmPoll.bind(null, pollId, opt.id, teamId)} className="mt-3">
                      <SubmitButton label="この日で確定" />
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
