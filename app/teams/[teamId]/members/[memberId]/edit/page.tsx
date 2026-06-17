import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMember } from "@/lib/actions/member";
import { DeleteMemberButton } from "./_components/DeleteMemberButton";
import { SubmitButton } from "@/app/_components/SubmitButton";

type Props = { params: Promise<{ teamId: string; memberId: string }> };

const MEMBERSHIP_STATUS_LABEL: Record<string, string> = {
  active: "在籍中",
  inactive: "休止中",
  left: "退団済み",
};

export default async function EditMemberPage({ params }: Props) {
  const { teamId, memberId } = await params;

  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member || member.teamId !== teamId) notFound();

  const action = updateMember.bind(null, memberId, teamId);

  const joinedAtValue = member.joinedAt
    ? new Date(member.joinedAt).toISOString().split("T")[0]
    : "";

  return (
    <div>
      <Link href={`/teams/${teamId}/members`} className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">← メンバー一覧に戻る</Link>
      <h2 className="text-lg font-bold text-gray-900 mb-4">メンバーを編集</h2>

      <form action={action} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            表示名 <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            defaultValue={member.displayName}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="uniformNumber" className="block text-sm font-medium text-gray-700 mb-1">
              背番号
            </label>
            <input
              id="uniformNumber"
              name="uniformNumber"
              type="number"
              min={0}
              max={99}
              defaultValue={member.uniformNumber ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              ポジション
            </label>
            <select
              id="position"
              name="position"
              defaultValue={member.position ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">未設定</option>
              <option value="GK">GK</option>
              <option value="FP">FP</option>
              <option value="ピヴォ">ピヴォ</option>
              <option value="アラ">アラ</option>
              <option value="フィクソ">フィクソ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="uniformSize" className="block text-sm font-medium text-gray-700 mb-1">
              ユニフォームサイズ
            </label>
            <select
              id="uniformSize"
              name="uniformSize"
              defaultValue={member.uniformSize ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">未設定</option>
              <option>XS</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </select>
          </div>
          <div>
            <label htmlFor="joinedAt" className="block text-sm font-medium text-gray-700 mb-1">
              入団日
            </label>
            <input
              id="joinedAt"
              name="joinedAt"
              type="date"
              defaultValue={joinedAtValue}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="membershipStatus" className="block text-sm font-medium text-gray-700 mb-1">
            在籍ステータス
          </label>
          <select
            id="membershipStatus"
            name="membershipStatus"
            defaultValue={member.membershipStatus}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {Object.entries(MEMBERSHIP_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={member.notes ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SubmitButton label="保存する" />
      </form>

      <div className="mt-4">
        <hr className="border-gray-200 mb-4" />
        <DeleteMemberButton memberId={memberId} teamId={teamId} />
      </div>
    </div>
  );
}
