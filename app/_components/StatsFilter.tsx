"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const LEVELS = ["ウルトラビギナー", "スーパービギナー", "ビギナー", "その他"] as const;

type Props = {
  years: number[];
  currentYear?: string;
  currentLevel?: string;
  currentFrom?: string;
  currentTo?: string;
};

export function StatsFilter({ years, currentYear, currentLevel, currentFrom, currentTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState(currentFrom ?? "");
  const [to, setTo] = useState(currentTo ?? "");

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const values: Record<string, string | undefined> = {
      year: currentYear,
      level: currentLevel,
      from: currentFrom,
      to: currentTo,
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleYearClick(year: string | undefined) {
    router.push(buildUrl({ year, from: undefined, to: undefined }));
  }

  function handleLevelChange(level: string) {
    router.push(buildUrl({ level: level || undefined }));
  }

  function handleDateApply() {
    router.push(buildUrl({ from: from || undefined, to: to || undefined, year: undefined }));
  }

  function handleReset() {
    setFrom("");
    setTo("");
    router.push(pathname);
  }

  const activeYear = currentYear;
  const hasCustomDate = currentFrom || currentTo;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* 年タブ */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">期間</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleYearClick(undefined)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              !activeYear && !hasCustomDate
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            すべて
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handleYearClick(String(y))}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                activeYear === String(y)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {y}年
            </button>
          ))}
        </div>

        {/* カスタム日付範囲 */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">〜</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleDateApply}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shrink-0"
          >
            適用
          </button>
        </div>
      </div>

      {/* 大会レベル */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">大会レベル</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleLevelChange("")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              !currentLevel
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            すべて
          </button>
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleLevelChange(l)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                currentLevel === l
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* リセット */}
      {(activeYear || hasCustomDate || currentLevel) && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          フィルターをリセット
        </button>
      )}
    </div>
  );
}
