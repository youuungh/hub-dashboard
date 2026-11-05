"use client";

import { HaloLogo } from "@/components/halo-logo";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/constants/data";
import { IconMenu2 } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import SearchInput from "../search-input";
import { NavList } from "./app-sidebar";
import { UserMenu } from "./user-menu";

function useCrumb() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/profile")) return "계정 설정";
  return navItems.find((item) => pathname.startsWith(item.url))?.title ?? "";
}

// 좁은 화면에서는 사이드바 대신 시트로
function MobileNav() {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="메뉴 열기"
          className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1.5 flex size-7 items-center justify-center rounded-md md:hidden"
        >
          <IconMenu2 className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-2 pt-12">
        <SheetTitle className="sr-only">메뉴</SheetTitle>
        <NavList onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const crumb = useCrumb();

  return (
    <header className="bg-background flex h-12 shrink-0 items-center justify-between gap-3 border-b pr-3 pl-4">
      <div className="flex min-w-0 items-center gap-2.5 text-[13px] whitespace-nowrap">
        <MobileNav />
        <Link
          href="/dashboard/overview"
          aria-label="대시보드로"
          className="flex size-6 shrink-0"
        >
          <HaloLogo />
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium">Hub Admin</span>
        {crumb && (
          <>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground truncate">{crumb}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SearchInput />
        <UserMenu />
      </div>
    </header>
  );
}
