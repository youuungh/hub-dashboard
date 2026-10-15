"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityCell } from "@/components/table/entity-cell";
import { UserAvatar } from "@/components/user-avatar";
import { getApiErrorMessage } from "@/lib/api/client";
import { getUserProfile } from "@/lib/api/users";
import type { UserRole } from "@/types/user";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "관리자",
  CREATOR: "크리에이터",
  USER: "일반",
};

export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "border-primary/30 bg-primary/10 text-primary";
    case "CREATOR":
      return "border-primary/20 bg-primary/5 text-primary/90";
    default:
      return "text-muted-foreground font-normal";
  }
};

export interface ProfileUser {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
}

const STATS = [
  { key: "followerCount", label: "팔로워" },
  { key: "followingCount", label: "팔로잉" },
  { key: "postCount", label: "게시물" },
] as const;

// 목록 3종이 공유하는 사용자 셀, 누르면 프로필
// 권한·집계가 없으면 열 때 프로필 조회로 채움
export function UserProfileCell({
  userId,
  user,
  complete = false,
}: {
  userId: number;
  user: ProfileUser;
  /** 권한·집계를 믿을 수 있을 때만 true */
  complete?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const {
    data: fetched,
    isPending,
    error,
  } = useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => getUserProfile(userId),
    enabled: open && !complete,
  });
  const loading = !complete && isPending;
  // 조회 전엔 이름·아바타만, 딸려온 집계는 무시
  const shown: ProfileUser =
    fetched ??
    (complete
      ? user
      : {
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        });
  const name = shown.displayName || shown.username;

  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-left transition-opacity hover:opacity-80"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <EntityCell
          avatarUrl={user.avatarUrl}
          primary={user.displayName || user.username}
          secondary={user.displayName ? `@${user.username}` : undefined}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm sm:max-w-sm" showCloseButton={false}>
          <DialogTitle className="sr-only">{name} 프로필</DialogTitle>
          <DialogClose className="ring-offset-background absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-0 focus:outline-none disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </DialogClose>
          <div className="flex flex-col items-center space-y-6 p-6">
            <UserAvatar src={shown.avatarUrl} className="size-40" />

            <div className="space-y-3 text-center">
              <div className="space-y-1">
                <h3 className="text-foreground text-xl font-medium">{name}</h3>
                {shown.displayName && (
                  <p className="text-muted-foreground text-sm">
                    @{shown.username}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {loading && <Skeleton className="h-6 w-16 rounded-full" />}
                {shown.role && (
                  <Badge
                    variant="outline"
                    className={`${getRoleBadgeColor(shown.role)} rounded-full border-0 px-2.5 py-1 text-xs font-normal`}
                  >
                    {ROLE_LABELS[shown.role] ?? shown.role}
                  </Badge>
                )}
              </div>
            </div>

            {error ? (
              <p className="bg-muted/60 text-muted-foreground w-full rounded-lg p-3 text-center text-sm">
                {getApiErrorMessage(error) || "프로필을 불러오지 못했습니다"}
              </p>
            ) : (
              <div className="grid w-full grid-cols-3 gap-6 pt-4">
                {STATS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center space-y-1"
                  >
                    {loading ? (
                      <Skeleton className="h-8 w-10" />
                    ) : (
                      <p className="text-foreground text-2xl font-medium">
                        {(shown[key] ?? 0).toLocaleString()}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
