"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  teamId: string;
};

export function TeamNav({ teamId }: Props) {
  const pathname = usePathname();

  const navItems = [
    { href: `/teams/${teamId}`, label: "ホーム" },
    { href: `/teams/${teamId}/members`, label: "メンバー" },
    { href: `/teams/${teamId}/polls`, label: "日程" },
    { href: `/teams/${teamId}/events`, label: "活動" },
    { href: `/teams/${teamId}/matches`, label: "試合" },
    { href: `/teams/${teamId}/stats`, label: "成績" },
    { href: `/teams/${teamId}/settings`, label: "設定" },
  ];

  return (
    <nav className="max-w-lg mx-auto px-4">
      <div className="flex border-t border-gray-100">
        {navItems.map((item) => {
          const isActive =
            item.href === `/teams/${teamId}`
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center text-sm py-2.5 font-medium transition-colors ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
