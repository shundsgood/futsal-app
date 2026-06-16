"use client";

import { deleteEvent } from "@/lib/actions/event";

type Props = { eventId: string; teamId: string };

export function DeleteEventButton({ eventId, teamId }: Props) {
  const action = deleteEvent.bind(null, eventId, teamId);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("このイベントを削除しますか？\n出欠・試合結果・得点記録もすべて削除されます。")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="w-full border border-red-200 text-red-500 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition"
      >
        このイベントを削除する
      </button>
    </form>
  );
}
