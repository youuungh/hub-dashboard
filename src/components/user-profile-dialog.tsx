"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityCell } from "@/components/table/entity-cell";
import { UserAvatar } from "@/components/user-avatar";
import { VerifiedBadge } from "@/components/verified-badge";
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
    case "CREATOR":
      return "font-normal";
    default:
      return "bg-muted text-muted-foreground border-transparent font-normal";
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
  /** 크리에이터·관리자만, 일반은 null */
  subscriberCount?: number | null;
}

const STATS = [
  { key: "followerCount", label: "팔로워" },
  { key: "followingCount", label: "팔로잉" },
  { key: "postCount", label: "포스트" },
] as const;

const isVerified = (role?: UserRole) => role === "CREATOR" || role === "ADMIN";

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

  // 구독자 수는 프로필 응답에만 있어 열 때 항상 조회
  const {
    data: fetched,
    isPending,
    error,
  } = useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => getUserProfile(userId),
    enabled: open,
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
  const subscribers = fetched?.subscriberCount;
  const stats =
    typeof subscribers === "number"
      ? [...STATS, { key: "subscriberCount", label: "구독자" } as const]
      : STATS;

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
          verified={isVerified(user.role)}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="gap-5 sm:max-w-[420px]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{name} 프로필</DialogTitle>
          <div className="flex items-center gap-3.5">
            <UserAvatar src={shown.avatarUrl} className="size-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[17px] font-semibold">{name}</h3>
                {isVerified(shown.role) && <VerifiedBadge className="size-4" />}
              </div>
              <p className="text-muted-foreground truncate text-sm">
                @{shown.username}
              </p>
            </div>
            {loading && <Skeleton className="h-6 w-16 rounded-md" />}
            {shown.role && (
              <Badge
                variant="outline"
                className={getRoleBadgeColor(shown.role)}
              >
                {ROLE_LABELS[shown.role] ?? shown.role}
              </Badge>
            )}
          </div>

          {error ? (
            <p className="bg-muted/60 text-muted-foreground w-full rounded-lg p-3 text-center text-sm">
              {getApiErrorMessage(error) || "프로필을 불러오지 못했습니다"}
            </p>
          ) : (
            <div
              className="divide-border grid divide-x rounded-lg border"
              style={{
                gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
              }}
            >
              {stats.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center py-3">
                  {loading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <span className="text-lg font-semibold tabular-nums">
                      {(shown[key] ?? 0).toLocaleString()}
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs">{label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">닫기</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
