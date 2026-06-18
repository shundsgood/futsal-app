"use client";

import { useState } from "react";
import Link from "next/link";

import { deletePolls } from "@/lib/actions/poll";

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

type Poll = {
  id: string;
  title: string;
  status: string;
  options: { startDatetime: Date | string }[];
  _count: { options: number };
  responseDeadline: Date | string | null;
};

type Props = { teamId: string; polls: Poll[] };

export function PollList({ teamId, polls }: Props) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した ${selected.size} 件の日程調整を削除しますか？`)) return;
    setPending(true);
    await deletePolls(Array.from(selected), teamId);
  };

  const handleCancel = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">日程調整一覧</h2>
        <div className="flex items-center gap-2">
          {selecting ? (
            <>
              {selected.size > 0 && (
                <button
                  onClick={handleDelete}
                  disabled={pending}
                  className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {pending ? "削除中..." : `削除 (${selected.size})`}
                </button>
              )}
              <button
                onClick={handleCancel}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
              >
                キャンセル
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/teams/${teamId}/polls/new`}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
              >
                ＋ 作成
              </Link>
              <button
                onClick={() => setSelecting(true)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
              >
                選択
              </button>
            </>
          )}
        </div>
      </div>

      {polls.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          日程調整がありません
        </div>
      ) : (
        <ul className="space-y-3">
          {polls.map((poll) => {
            const isSelected = selected.has(poll.id);
            const earliest = poll.options[0];
            const inner = (
              <div
                className={`bg-white rounded-xl border px-4 py-4 transition ${
                  selecting
                    ? isSelected
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                    : "border-gray-200 hover:border-blue-400 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {selecting && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(poll.id)}
                      className="mt-1 h-4 w-4 accent-red-500 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
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
                  </div>
                </div>
              </div>
            );

            return (
              <li key={poll.id}>
                {selecting ? (
                  <div onClick={() => toggle(poll.id)} className="cursor-pointer">
                    {inner}
                  </div>
                ) : (
                  <Link href={`/teams/${teamId}/polls/${poll.id}`}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
