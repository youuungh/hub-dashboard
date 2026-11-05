"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MediaThumb } from "@/components/media-thumb";
import { UserAvatar } from "@/components/user-avatar";
import { parseServerDate, tierLabel } from "@/lib/format";
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
        className="flex w-full min-w-0 cursor-pointer items-center gap-3 text-left transition-opacity hover:opacity-80"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {first && (
          <span className="relative shrink-0">
            <MediaThumb media={first} className="size-8" />
            {data.mediaItems.length > 1 && (
              <span className="absolute right-0.5 bottom-0.5 rounded bg-black/60 px-0.5 text-[9.5px] leading-3.5 font-semibold text-white tabular-nums">
                +{data.mediaItems.length - 1}
              </span>
            )}
          </span>
        )}
        <span className="text-foreground/80 min-w-0 truncate text-sm">
          {data.content || "—"}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-[480px]"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>포스트 #{data.id}</DialogTitle>
            <Badge
              variant="outline"
              className={
                data.isActive
                  ? "font-normal"
                  : "bg-muted text-muted-foreground border-transparent font-normal"
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
                {tierLabel(data.requiredTier)}
              </Badge>
            )}
            {(data.isPinnedInFeed || data.isPinnedInCommunity) && (
              <Badge variant="outline" className="font-normal">
                고정됨
              </Badge>
            )}
          </DialogHeader>

          {/* 작성자·본문·첨부만 스크롤 */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <div className="flex items-center gap-2.5">
              <UserAvatar src={data.author.avatarUrl} className="size-8" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">
                  {data.author.displayName || data.author.username}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  @{data.author.username} ·{" "}
                  {FULL.format(parseServerDate(data.createdAt))}
                </p>
              </div>
            </div>

            {body && (
              <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                {body}
              </p>
            )}

            <PostMediaGrid items={data.mediaItems} />
          </div>

          {/* 태그·집계는 항상 보이게 */}
          <DialogFooter className="shrink-0 flex-col items-start">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
