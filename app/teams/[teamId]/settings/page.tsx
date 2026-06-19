import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DeleteTeamButton } from "./_components/DeleteTeamButton";
import { CopyInviteLinkButton } from "./_components/CopyInviteLinkButton";

type Props = { params: Promise<{ teamId: string }> };

export default async function TeamSettingsPage({ params }: Props) {
  const { teamId } = await params;

  const [team, headersList] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId } }),
    headers(),
  ]);
  if (!team) notFound();

  const host = headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;
  const inviteUrl = `${baseUrl}/teams/${teamId}`;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">チーム設定</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
        <p className="text-sm font-medium text-gray-700">チーム名</p>
        <p className="text-gray-900">{team.name}</p>
        {team.activityArea && (
          <>
            <p className="text-sm font-medium text-gray-700 pt-2">活動エリア</p>
            <p className="text-gray-900">{team.activityArea}</p>
          </>
        )}
        {team.description && (
          <>
            <p className="text-sm font-medium text-gray-700 pt-2">説明</p>
            <p className="text-gray-900">{team.description}</p>
          </>
        )}
      </div>

      {/* 招待リンク */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-1">招待リンク</p>
        <p className="text-xs text-gray-500 mb-3">
          このリンクを共有するとチームに参加できます
        </p>
        <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 break-all mb-3 font-mono">
          {inviteUrl}
        </p>
        <CopyInviteLinkButton url={inviteUrl} />
      </div>

      <div>
        <hr className="border-gray-200 mb-4" />
        <p className="text-sm text-gray-500 mb-3">
          チームを削除すると、メンバー・日程調整・活動・試合記録がすべて削除されます。この操作は取り消せません。
        </p>
        <DeleteTeamButton teamId={teamId} teamName={team.name} />
      </div>
    </div>
  );
}
