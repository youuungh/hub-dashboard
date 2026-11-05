import type { ReactNode } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { VerifiedBadge } from "@/components/verified-badge";

// 목록 3종이 대상을 같은 모양으로 보이는 셀
export function EntityCell({
  avatarUrl,
  primary,
  secondary,
  leading,
  verified = false,
}: {
  avatarUrl?: string | null;
  primary: ReactNode;
  secondary?: ReactNode;
  /** 아바타 대신 넣을 요소 */
  leading?: ReactNode;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {leading ?? <UserAvatar src={avatarUrl} className="size-9 shrink-0" />}
      <div className="min-w-0">
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="truncate">{primary}</span>
          {verified && <VerifiedBadge className="-translate-y-px" />}
        </div>
        {secondary && (
          <div className="text-muted-foreground truncate text-xs">
            {secondary}
          </div>
        )}
      </div>
    </div>
  );
}
