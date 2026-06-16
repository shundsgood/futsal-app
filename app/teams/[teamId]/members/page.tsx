import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ teamId: string }> };

const STATUS_LABEL: Record<string, string> = {
  active: "在籍中",
  inactive: "休止中",
  left: "退団済み",
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-yellow-100 text-yellow-700",
  left: "bg-gray-100 text-gray-500",
};

export default async function MembersPage({ params }: Props) {
  const { teamId } = await params;

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    orderBy: [{ membershipStatus: "asc" }, { uniformNumber: "asc" }, { displayName: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">メンバー一覧</h2>
        <Link
          href={`/teams/${teamId}/members/new`}
          className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          + 追加
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          メンバーがいません
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {m.uniformNumber ?? "—"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{m.displayName}</p>
                <p className="text-xs text-gray-500">{m.position ?? "ポジション未設定"}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  STATUS_COLOR[m.membershipStatus] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {STATUS_LABEL[m.membershipStatus] ?? m.membershipStatus}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
