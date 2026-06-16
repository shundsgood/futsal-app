import { createTeam } from "@/lib/actions/team";

export default function NewTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">チーム作成</h1>

        <form action={createTeam} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              チーム名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：フットサル部"
            />
          </div>

          <div>
            <label htmlFor="activityArea" className="block text-sm font-medium text-gray-700 mb-1">
              活動エリア
            </label>
            <input
              id="activityArea"
              name="activityArea"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：東京都渋谷区"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              チーム説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="チームの紹介など"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            作成する
          </button>
        </form>
      </div>
    </div>
  );
}
