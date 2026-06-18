"use client";

import { deleteTeam } from "@/lib/actions/team";

type Props = { teamId: string; teamName: string };

export function DeleteTeamButton({ teamId, teamName }: Props) {
  const handleDelete = async () => {
    if (!confirm(`「${teamName}」を削除しますか？\nメンバー・日程調整・活動・試合記録がすべて削除されます。`)) return;
    await deleteTeam(teamId);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="w-full border border-red-300 text-red-600 font-medium py-2.5 rounded-lg hover:bg-red-50 transition"
    >
      チームを削除する
    </button>
  );
}
