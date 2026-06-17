"use client";

import { deleteMember } from "@/lib/actions/member";

type Props = { memberId: string; teamId: string };

export function DeleteMemberButton({ memberId, teamId }: Props) {
  const handleDelete = async () => {
    if (!confirm("メンバーを削除しますか？関連する出欠・試合記録も削除されます。")) return;
    await deleteMember(memberId, teamId);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="w-full border border-red-300 text-red-600 font-medium py-2.5 rounded-lg hover:bg-red-50 transition"
    >
      削除する
    </button>
  );
}
