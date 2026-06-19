import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { JoinByCodeForm } from "@/app/_components/JoinByCodeForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">チーム一覧</h1>
            <p className="text-sm text-gray-500 mt-1">{user.displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/teams/new"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + チーム作成
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 px-2 py-2"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>

        {/* コードで参加 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">コードで参加</p>
          <JoinByCodeForm />
        </div>

        {teams.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-4">チームがまだありません</p>
            <Link
              href="/teams/new"
              className="text-blue-600 font-medium hover:underline"
            >
              最初のチームを作成する
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {teams.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/teams/${team.id}`}
                  className="block bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-400 hover:shadow-sm transition"
                >
                  <p className="font-semibold text-gray-900">{team.name}</p>
                  {team.activityArea && (
                    <p className="text-sm text-gray-500 mt-0.5">{team.activityArea}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
