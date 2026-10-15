import { Play } from "lucide-react";
import { cn, mediaThumbUrl } from "@/lib/utils";
import type { PostMedia } from "@/types/post";

// 목록 셀 썸네일, 그리드와 소스 규칙 공유
export function MediaThumb({
  media,
  className,
}: {
  media: PostMedia;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-muted relative block shrink-0 overflow-hidden rounded-md",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 원격 썸네일, next/image 최적화 대상 아님 */}
      <img
        src={mediaThumbUrl(media)}
        alt=""
        loading="lazy"
        className="size-full object-cover"
      />
      {media.type === "VIDEO" && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/35">
          <Play className="size-3.5 fill-white text-white" />
        </span>
      )}
    </span>
  );
}
