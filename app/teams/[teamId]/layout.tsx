import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
};

export default async function TeamLayout({ children, params }: Props) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  const navItems = [
    { href: `/teams/${teamId}`, label: "ホーム" },
    { href: `/teams/${teamId}/members`, label: "メンバー" },
    { href: `/teams/${teamId}/polls`, label: "日程調整" },
  ];

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
        {/* Nav tabs */}
        <nav className="max-w-lg mx-auto px-4">
          <div className="flex border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 text-center text-sm py-2.5 text-gray-600 hover:text-blue-600 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
