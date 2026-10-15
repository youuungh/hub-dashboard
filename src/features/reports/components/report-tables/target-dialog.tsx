"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { EntityCell } from "@/components/table/entity-cell";
import { getReportedTargetDetail } from "@/lib/api/reports";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { ReportedTarget } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import { FileText, MessageSquare, User as UserIcon } from "lucide-react";
import { parseServerDate } from "@/lib/format";
import { splitTrailingHashtags } from "@/lib/utils";
import { PostMediaGrid } from "@/components/post-media-grid";

const FULL = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

const TYPE_LABELS: Record<ReportedTarget["targetType"], string> = {
  POST: "포스트",
  COMMENT: "댓글",
  USER: "사용자",
};

const TYPE_ICONS = {
  POST: FileText,
  COMMENT: MessageSquare,
  USER: UserIcon,
} as const;

export function TargetDialog({ data }: { data: ReportedTarget }) {
  const [open, setOpen] = useState(false);

  const Icon = TYPE_ICONS[data.targetType];

  // 관리자 전용, 숨긴 대상도 내용 확인
  const query = useQuery({
    queryKey: queryKeys.reportTarget(data.targetType, data.targetId),
    queryFn: () => getReportedTargetDetail(data.targetType, data.targetId),
    enabled: open,
  });
  const detail = query.data;
  const loading = open && query.isPending;
  const error = query.error
    ? getApiErrorMessage(query.error) || "대상 정보를 불러오지 못했습니다"
    : null;

  const author = detail?.author;
  // 상세엔 tags가 없어 본문에서 뽑음
  const { body, tags } = splitTrailingHashtags(detail?.content ?? "");

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
          leading={
            <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Icon className="size-4" />
            </span>
          }
          primary={TYPE_LABELS[data.targetType]}
          secondary={`#${data.targetId}`}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 본문만 스크롤, 집계는 하단 고정 */}
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
          <DialogTitle>
            신고된 {TYPE_LABELS[data.targetType]} #{data.targetId}
          </DialogTitle>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-muted-foreground">
              신고 {data.reportCount}건
            </Badge>
            <Badge
              variant="outline"
              className={
                data.isBlinded
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "text-muted-foreground font-normal"
              }
            >
              {data.isBlinded ? "숨김" : "공개"}
            </Badge>
            {data.moderationLocked && (
              <Badge variant="outline" className="text-muted-foreground">
                자동 블라인드 잠금
              </Badge>
            )}
          </div>

          <div className="-mr-1 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {loading && (
              <>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
              </>
            )}

            {!loading && error && (
              <p className="bg-muted/60 text-muted-foreground rounded-lg p-3 text-sm">
                {error}
              </p>
            )}

            {!loading && !error && detail && (
              <>
                {author && (
                  <div className="flex items-center gap-3">
                    <UserAvatar src={author.avatarUrl} className="size-10" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {author.displayName || author.username}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        @{author.username}
                        {detail.createdAt &&
                          ` · ${FULL.format(parseServerDate(detail.createdAt))}`}
                      </p>
                    </div>
                  </div>
                )}

                {data.targetType === "USER" ? (
                  <p className="text-muted-foreground text-sm">
                    이 사용자는 블라인드 대상이 아닙니다. 누적 신고만 확인할 수
                    있습니다.
                  </p>
                ) : body ? (
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {body}
                  </p>
                ) : detail.mediaItems?.length ? null : (
                  <p className="text-muted-foreground text-sm">
                    표시할 본문이 없습니다.
                  </p>
                )}

                <PostMediaGrid items={detail.mediaItems ?? []} />
              </>
            )}

            {!loading && !error && !detail && data.targetType === "USER" && (
              <UserAvatar className="size-16" />
            )}
          </div>

          {!loading &&
            !error &&
            detail &&
            (tags.length > 0 ||
              detail.likeCount != null ||
              detail.commentCount != null) && (
              <div className="shrink-0 space-y-3 border-t pt-3">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="font-normal"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {(detail.likeCount != null || detail.commentCount != null) && (
                  <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                    {detail.likeCount != null && (
                      <span>좋아요 {detail.likeCount.toLocaleString()}</span>
                    )}
                    {detail.commentCount != null && (
                      <span>댓글 {detail.commentCount.toLocaleString()}</span>
                    )}
                  </div>
                )}
              </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
