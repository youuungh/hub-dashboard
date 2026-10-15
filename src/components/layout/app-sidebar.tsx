"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navItems } from "@/constants/data";
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout,
} from "@tabler/icons-react";
import { User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Icons } from "../icons";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";
import { useMe } from "@/hooks/use-me";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { logout } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { tokenStore } from "@/lib/token";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);

      await logout();
      tokenStore.clear();
      // 다른 계정 로그인 때 이전 캐시가 안 보이게
      queryClient.clear();

      toast.success("로그아웃되었습니다");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "로그아웃에 실패했습니다");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.displayName || user?.username || "Unknown User";
  const displayEmail = user?.email || "이메일 없음";
  const avatarUrl = user?.avatarUrl || "";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Icons.logo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Hub Admin</span>
                  <span className="truncate text-xs">관리자 콘솔</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title} className="relative">
                  {pathname === item.url && !reduceMotion && (
                    <motion.span
                      layoutId="sidebar-active"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                      className="bg-primary/[0.07] absolute inset-0 rounded-md"
                    />
                  )}
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className="relative bg-transparent! data-[active=true]:bg-transparent!"
                  >
                    <Link
                      href={item.url}
                      onClick={(e) => {
                        // 같은 경로면 쿼리만 지우고 이동
                        if (pathname === item.url && window.location.search) {
                          e.preventDefault();
                          window.location.href = item.url;
                        }
                      }}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {!user ? (
              <SidebarMenuButton size="lg" disabled className="cursor-wait">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/50 animate-skeleton">
                  <div className="size-3 rounded bg-sidebar-primary-foreground/50" />
                </div>
                <div className="grid flex-1 gap-1.5 text-left text-sm leading-tight">
                  <div className="h-3.5 w-20 bg-muted animate-skeleton rounded" />
                  <div className="h-3 w-32 bg-muted animate-skeleton rounded" />
                </div>
                <IconChevronsDown className="ml-auto size-4 opacity-30" />
              </SidebarMenuButton>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <UserAvatar
                      src={avatarUrl}
                      alt={displayName}
                      className="h-8 w-8"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {displayEmail}
                      </span>
                    </div>
                    <IconChevronsDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <UserAvatar
                        src={avatarUrl}
                        alt={displayName}
                        className="h-8 w-8"
                      />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {displayName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                  >
                    <IconLogout className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
