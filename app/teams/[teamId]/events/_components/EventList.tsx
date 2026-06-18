"use client";

import { useState } from "react";
import Link from "next/link";

import { deleteEvents } from "@/lib/actions/event";
import { EVENT_TYPE_LABEL, EVENT_TYPE_COLOR } from "@/lib/constants";

function getStatusLabel(status: string, startDatetime: Date): string {
  if (status === "cancelled") return "中止";
  return new Date() < startDatetime ? "開催前" : "完了";
}

function getStatusColor(status: string, startDatetime: Date): string {
  if (status === "cancelled") return "bg-red-100 text-red-600";
  return new Date() < startDatetime ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500";
}

type Event = {
  id: string;
  title: string;
  eventType: string | null;
  status: string;
  startDatetime: Date;
  venueName: string | null;
  finalRank: string | null;
  attendances: { id: string }[];
};

type Props = { teamId: string; events: Event[] };

export function EventList({ teamId, events }: Props) {
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
    if (!confirm(`選択した ${selected.size} 件のイベントを削除しますか？`)) return;
    setPending(true);
    await deleteEvents(Array.from(selected), teamId);
  };

  const handleCancel = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  if (events.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link
            href={`/teams/${teamId}/events/new`}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
          >
            ＋ 活動を作成
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          イベントがありません
          <p className="text-xs mt-2 text-gray-400">日程調整で候補日を確定するか、直接活動を作成できます</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">イベント一覧</h2>
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
                href={`/teams/${teamId}/events/new`}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
              >
                ＋ 活動を作成
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

      <ul className="space-y-3">
        {events.map((event) => {
          const isSelected = selected.has(event.id);
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
                    onChange={() => toggle(event.id)}
                    className="mt-1 h-4 w-4 accent-red-500 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      {event.eventType && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                            EVENT_TYPE_COLOR[event.eventType] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(event.status, event.startDatetime)}`}
                    >
                      {getStatusLabel(event.status, event.startDatetime)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>
                      {new Date(event.startDatetime).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {event.venueName && <span>{event.venueName}</span>}
                    {event.finalRank && (
                      <span className="font-medium text-blue-600">{event.finalRank}</span>
                    )}
                    <span className="text-green-600 font-medium">
                      参加 {event.attendances.length}人
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );

          return (
            <li key={event.id}>
              {selecting ? (
                <div onClick={() => toggle(event.id)} className="cursor-pointer">
                  {inner}
                </div>
              ) : (
                <Link href={`/teams/${teamId}/events/${event.id}`}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
