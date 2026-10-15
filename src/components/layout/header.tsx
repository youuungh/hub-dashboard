"use client";

import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { Breadcrumbs } from "../breadcrumbs";
import { ModeToggle } from "./theme/theme-toggle";
import SearchInput from "../search-input";

// 본문이 밑으로 지나가며 흐려지는 플로팅 헤더
export default function Header() {
  return (
    <header className="bg-card/75 supports-[backdrop-filter]:bg-card/65 border-border/50 absolute inset-x-3 top-3 z-50 border shadow-sm backdrop-blur-xl backdrop-saturate-180 flex h-14 shrink-0 items-center justify-between gap-2 rounded-2xl px-3 md:inset-x-4 md:top-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-0.5" />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex">
          <SearchInput />
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
