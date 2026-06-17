import Link from "next/link";
import { createMember } from "@/lib/actions/member";
import { SubmitButton } from "@/app/_components/SubmitButton";

type Props = { params: Promise<{ teamId: string }> };

export default async function NewMemberPage({ params }: Props) {
  const { teamId } = await params;

  const action = createMember.bind(null, teamId);

  return (
    <div>
      <Link href={`/teams/${teamId}/members`} className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">← メンバー一覧に戻る</Link>
      <h2 className="text-lg font-bold text-gray-900 mb-4">メンバー追加</h2>

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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SubmitButton label="追加する" />
      </form>
    </div>
  );
}
