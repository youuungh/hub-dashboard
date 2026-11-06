"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_GROUPS, navItems } from "@/constants/data";
import { IconLayoutSidebar } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Icons } from "../icons";
import { useQuery } from "@tanstack/react-query";
import { getBotSummary } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  BOT_STATE_DOTS,
  BOT_STATE_LABELS,
  botState,
} from "@/features/bot/status";
import {
  SIDEBAR_MODE_COOKIE,
  SIDEBAR_MODE_LABELS,
  type SidebarMode,
  parseSidebarMode,
} from "./sidebar-mode";

// 자동화 메뉴 옆 작동 상태, 못 불러오면 숨김
function BotStatus() {
  const { data } = useQuery({
    queryKey: queryKeys.bot,
    queryFn: getBotSummary,
    refetchInterval: 30_000,
  });
  if (!data) return null;
  const state = botState(data);
  return (
    <span
      title={BOT_STATE_LABELS[state]}
      className={cn(
        "ml-auto size-1.5 shrink-0 rounded-full",
        BOT_STATE_DOTS[state],
      )}
    >
      <span className="sr-only">{BOT_STATE_LABELS[state]}</span>
    </span>
  );
}

// 좁을 때는 아이콘만 보이고 글자는 잘림
export function NavList({
  tooltips = false,
  onNavigate,
}: {
  tooltips?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="주 메뉴" className="flex flex-col gap-0.5">
      {NAV_GROUPS.map((group, groupIndex) => (
        <React.Fragment key={group}>
          {groupIndex > 0 && <div className="bg-border mx-1 my-2 h-px" />}
          {navItems
            .filter((item) => item.group === group)
            .map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const active = pathname.startsWith(item.url);
              const link = (
                <Link
                  href={item.url}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    // 같은 경로면 쿼리만 지우고 이동
                    if (pathname === item.url && window.location.search) {
                      e.preventDefault();
                      window.location.href = item.url;
                    }
                    onNavigate?.();
                  }}
                  className={cn(
                    "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 focus-visible:outline-ring flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] whitespace-nowrap transition-colors focus-visible:outline-2",
                    active &&
                      "bg-sidebar-accent text-foreground hover:bg-sidebar-accent font-medium",
                  )}
                >
                  <Icon
                    className="size-4 shrink-0 -translate-y-px"
                    stroke={1.75}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.url === "/dashboard/bot" && <BotStatus />}
                </Link>
              );
              return tooltips ? (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                <React.Fragment key={item.title}>{link}</React.Fragment>
              );
            })}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default function AppSidebar({
  defaultMode,
}: {
  defaultMode: SidebarMode;
}) {
  const [mode, setMode] = React.useState<SidebarMode>(defaultMode);

  const changeMode = (value: string) => {
    const next = parseSidebarMode(value);
    setMode(next);
    document.cookie = `${SIDEBAR_MODE_COOKIE}=${next}; path=/; max-age=31536000`;
  };

  return (
    // 올리면 펼침은 자리는 좁게 두고 본문 위로 겹쳐 펼침
    <div
      className={cn(
        "relative hidden shrink-0 desk:block",
        mode === "expanded" ? "w-52" : "w-[52px]",
      )}
    >
      <aside
        className={cn(
          "bg-sidebar absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r p-2 transition-[width,box-shadow] duration-200 ease-out",
          mode === "expanded" && "w-52",
          mode === "collapsed" && "w-[52px]",
          mode === "hover" &&
            "bg-sidebar/70 w-[52px] backdrop-blur-xl backdrop-saturate-150 hover:w-52 hover:shadow-xl",
        )}
      >
        <NavList tooltips={mode === "collapsed"} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="사이드바 설정"
              className="text-muted-foreground hover:text-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-foreground focus-visible:outline-ring mt-auto ml-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2"
            >
              <IconLayoutSidebar className="size-4" stroke={1.75} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-44">
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
              사이드바
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={mode} onValueChange={changeMode}>
              {(Object.keys(SIDEBAR_MODE_LABELS) as SidebarMode[]).map(
                (key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {SIDEBAR_MODE_LABELS[key]}
                  </DropdownMenuRadioItem>
                ),
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    </div>
  );
}
