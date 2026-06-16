import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamNav } from "./TeamNav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
};

export default async function TeamLayout({ children, params }: Props) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
