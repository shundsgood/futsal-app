import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TeamNav } from "./TeamNav";
import { JoinPrompt } from "./_components/JoinPrompt";

type Props = {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
};

export default async function TeamLayout({ children, params }: Props) {
  const { teamId } = await params;

  const [user, team] = await Promise.all([
    getCurrentUser(),
    prisma.team.findUnique({ where: { id: teamId } }),
  ]);

  if (!team) notFound();

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
  });

  if (!member) {
    return <JoinPrompt teamId={teamId} teamName={team.name} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
              ←
            </Link>
            <span className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">
              {team.name}
            </span>
          </div>
        </div>
        <TeamNav teamId={teamId} />
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
