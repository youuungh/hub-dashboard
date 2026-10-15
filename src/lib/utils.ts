import type { PostMedia } from "@/types/post";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 본문 끝 해시태그 블록을 떼어냄
export function splitTrailingHashtags(content: string) {
  const match = content.match(/(?:\s*#[^\s#]+)+\s*$/);
  if (!match || match.index === undefined) return { body: content, tags: [] };

  return {
    body: content.slice(0, match.index).trimEnd(),
    tags: (match[0].match(/#[^\s#]+/g) ?? []).map((tag) => tag.slice(1)),
  };
}

// 인라인 표시는 썸네일 우선
export function mediaThumbUrl(media: PostMedia) {
  return media.thumbnailUrl ?? media.previewUrl ?? media.url;
}
