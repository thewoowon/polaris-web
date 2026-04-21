"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/reviews", label: "리뷰" },
  { href: "/queue", label: "검수 큐" },
  { href: "/kb", label: "지식 베이스" },
  { href: "/audit", label: "감사 로그" },
  { href: "/settings", label: "설정" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded bg-zinc-900 dark:bg-zinc-100" />
          <span className="font-semibold tracking-tight">Polaris</span>
        </Link>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">VOC Control</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        v0.1 · dev
      </div>
    </aside>
  );
}
