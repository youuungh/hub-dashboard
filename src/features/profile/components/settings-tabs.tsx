"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { title: "프로필", href: "/dashboard/profile" },
  { title: "보안", href: "/dashboard/profile/security" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="계정 설정" className="flex gap-5 overflow-x-auto">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-muted-foreground hover:text-foreground border-b-2 border-transparent px-px pt-1.5 pb-2.5 text-[13px] whitespace-nowrap transition-colors",
              active && "text-foreground border-foreground font-medium",
            )}
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
}
