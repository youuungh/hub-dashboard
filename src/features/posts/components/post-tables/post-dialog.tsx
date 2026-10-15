"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MediaThumb } from "@/components/media-thumb";
import { UserAvatar } from "@/components/user-avatar";
import { parseServerDate } from "@/lib/format";
import { splitTrailingHashtags } from "@/lib/utils";
import { PostMediaGrid } from "@/components/post-media-grid";
import type { AdminPost } from "@/types/post";

const FULL = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

// 목록 응답에 다 있어 따로 조회 안 함
export function PostDialog({ data }: { data: AdminPost }) {
  const [open, setOpen] = useState(false);

  // 본문 끝 해시태그는 떼어 알약으로만
  const { body } = splitTrailingHashtags(data.content);
  const [first] = data.mediaItems;

  return (
    <>
      {/* 본문을 누르면 포스트 정보 */}
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 text-left transition-opacity hover:opacity-80"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {first && <MediaThumb media={first} className="size-9" />}
        {data.mediaItems.length > 1 && (
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            +{data.mediaItems.length - 1}
          </span>
        )}
        <span className="text-muted-foreground block w-[16rem] max-w-full truncate text-sm">
          {data.content || "—"}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[85vh] flex-col sm:max-w-md"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogTitle>포스트 #{data.id}</DialogTitle>

          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={
                data.isActive
                  ? "text-muted-foreground font-normal"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }
            >
              {data.isActive ? "공개" : "숨김"}
            </Badge>
            {data.isSecret && (
              <Badge variant="outline" className="font-normal">
                비밀글
              </Badge>
            )}
            {data.requiredTier !== "FREE" && (
              <Badge variant="outline" className="font-normal">
                {data.requiredTier}
              </Badge>
            )}
            {(data.isPinnedInFeed || data.isPinnedInCommunity) && (
              <Badge variant="outline" className="font-normal">
                고정됨
              </Badge>
            )}
          </div>

          {/* 작성자·본문·첨부만 스크롤 */}
          <div className="-mr-1 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="flex items-center gap-3">
              <UserAvatar src={data.author.avatarUrl} className="size-10" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {data.author.displayName || data.author.username}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  @{data.author.username} ·{" "}
                  {FULL.format(parseServerDate(data.createdAt))}
                </p>
              </div>
            </div>

            {body && (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {body}
              </p>
            )}

            <PostMediaGrid items={data.mediaItems} />
          </div>

          {/* 태그·집계는 항상 보이게 */}
          <div className="shrink-0 space-y-3 border-t pt-3">
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
              <span>좋아요 {data.likeCount.toLocaleString()}</span>
              <span>댓글 {data.commentCount.toLocaleString()}</span>
              <span>조회 {data.viewCount.toLocaleString()}</span>
              <span>공유 {data.shareCount.toLocaleString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
