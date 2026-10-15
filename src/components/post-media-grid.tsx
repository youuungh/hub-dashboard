"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, mediaThumbUrl } from "@/lib/utils";
import type { PostMedia } from "@/types/post";

function Tile({
  media,
  className,
  style,
  overlayCount,
  onOpen,
}: {
  media: PostMedia;
  className?: string;
  style?: React.CSSProperties;
  overlayCount?: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "bg-muted focus-visible:ring-ring relative block cursor-zoom-in overflow-hidden transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 원격 썸네일, next/image 최적화 대상 아님 */}
      <img
        src={mediaThumbUrl(media)}
        alt=""
        loading="lazy"
        className="size-full object-cover"
      />
      {media.type === "VIDEO" && !overlayCount && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/55">
            <Play className="size-4 fill-white text-white" />
          </span>
        </span>
      )}
      {overlayCount ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
          +{overlayCount}
        </span>
      ) : null}
    </button>
  );
}

// 원본은 새 탭 대신 이 뷰어로
function MediaViewer({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: PostMedia[];
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  // 인덱스가 바뀌면 다시 로딩 상태로
  useEffect(() => setLoaded(false), [index]);

  if (index === null) return null;
  const media = items[index];
  const many = items.length > 1;
  const control =
    "flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        // 로드 전 튀지 않게 고정 무대에 contain
        className="fixed inset-0 top-0 left-0 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none border-0 bg-black/80 p-6 shadow-none backdrop-blur-none sm:max-w-none"
      >
        <DialogTitle className="sr-only">
          첨부 {index + 1} / {items.length}
        </DialogTitle>

        {/* 바깥을 누르면 닫힘 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute inset-0 -z-10 cursor-default"
        />

        {!loaded && (
          <Loader2 className="absolute size-7 animate-spin text-white/80" />
        )}

        {media.type === "VIDEO" ? (
          <video
            key={media.id}
            src={media.url}
            poster={media.thumbnailUrl ?? undefined}
            controls
            autoPlay
            onLoadedData={() => setLoaded(true)}
            className={cn(
              "max-h-full max-w-full rounded-xl shadow-2xl transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- 원격 원본, next/image 최적화 대상 아님
          <img
            key={media.id}
            src={media.url}
            alt=""
            onLoad={() => setLoaded(true)}
            className={cn(
              "max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        )}

        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className={cn(control, "absolute top-6 right-6 size-10")}
        >
          <X className="size-5" />
        </button>

        {many && (
          <>
            <button
              type="button"
              aria-label="이전 첨부"
              onClick={() =>
                onIndexChange((index - 1 + items.length) % items.length)
              }
              className={cn(
                control,
                "absolute top-1/2 left-6 size-11 -translate-y-1/2",
              )}
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              aria-label="다음 첨부"
              onClick={() => onIndexChange((index + 1) % items.length)}
              className={cn(
                control,
                "absolute top-1/2 right-6 size-11 -translate-y-1/2",
              )}
            >
              <ChevronRight className="size-6" />
            </button>
            {/* 하단은 비디오 컨트롤 바 자리라 위쪽에 둔다 */}
            <span className="absolute top-6 left-6 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
              {index + 1} / {items.length}
            </span>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 1장 원본 비율, 2장 좌우, 3장 좌1우2, 4장부터 2×2
export function PostMediaGrid({ items }: { items: PostMedia[] }) {
  const [viewer, setViewer] = useState<number | null>(null);

  if (items.length === 0) return null;

  const shell = "overflow-hidden rounded-xl";
  const open = (i: number) => () => setViewer(i);

  const grid = (() => {
    if (items.length === 1) {
      const [only] = items;
      const ratio =
        only.width && only.height ? `${only.width}/${only.height}` : "16/9";
      return (
        <Tile
          media={only}
          className={cn(shell, "max-h-80 w-full")}
          style={{ aspectRatio: ratio }}
          onOpen={open(0)}
        />
      );
    }

    if (items.length === 2) {
      return (
        <div className={cn(shell, "grid h-56 grid-cols-2 gap-0.5")}>
          {items.map((m, i) => (
            <Tile key={m.id} media={m} className="h-full" onOpen={open(i)} />
          ))}
        </div>
      );
    }

    if (items.length === 3) {
      const [first, ...rest] = items;
      return (
        <div className={cn(shell, "grid h-64 grid-cols-2 gap-0.5")}>
          <Tile media={first} className="h-full" onOpen={open(0)} />
          <div className="grid grid-rows-2 gap-0.5">
            {rest.map((m, i) => (
              <Tile
                key={m.id}
                media={m}
                className="h-full"
                onOpen={open(i + 1)}
              />
            ))}
          </div>
        </div>
      );
    }

    const visible = items.slice(0, 4);
    const hidden = items.length - visible.length;

    return (
      <div className={cn(shell, "grid h-64 grid-cols-2 grid-rows-2 gap-0.5")}>
        {visible.map((m, i) => (
          <Tile
            key={m.id}
            media={m}
            className="h-full"
            overlayCount={i === 3 && hidden > 0 ? hidden : undefined}
            onOpen={open(i)}
          />
        ))}
      </div>
    );
  })();

  return (
    <>
      {grid}
      <MediaViewer
        items={items}
        index={viewer}
        onIndexChange={setViewer}
        onClose={() => setViewer(null)}
      />
    </>
  );
}
