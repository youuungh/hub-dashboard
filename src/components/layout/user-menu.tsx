"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { useMe } from "@/hooks/use-me";
import { logout } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { tokenStore } from "@/lib/token";
import { IconLogout, IconShield, IconUser } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

const THEMES = [
  { value: "system", label: "시스템" },
  { value: "dark", label: "다크" },
  { value: "light", label: "라이트" },
];

export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

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

  if (!user) {
    return (
      <div className="bg-muted animate-skeleton size-[30px] rounded-full" />
    );
  }

  const displayName = user.displayName || user.username || "Unknown User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="계정 메뉴"
          className="focus-visible:outline-ring data-[state=open]:ring-foreground data-[state=open]:ring-offset-background rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=open]:ring-1 data-[state=open]:ring-offset-2"
        >
          <UserAvatar
            src={user.avatarUrl}
            alt={displayName}
            className="size-[30px]"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <DropdownMenuLabel className="px-2.5 py-2 font-normal">
          <div className="truncate font-semibold">{displayName}</div>
          <div className="text-muted-foreground truncate text-xs">
            {user.email || "이메일 없음"}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <IconUser />
            프로필
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile/security">
            <IconShield />
            보안
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          테마
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {THEMES.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
          <IconLogout />
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
