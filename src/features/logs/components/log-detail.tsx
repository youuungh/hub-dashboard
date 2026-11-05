"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/types/logs";
import { LEVEL_BADGES, formatLogTime } from "../options";

export function LogDetail({
  entry,
  onClose,
  onSource,
}: {
  entry: LogEntry;
  onClose: () => void;
  onSource: (source: string) => void;
}) {
  const copy = async () => {
    const text = [
      `${formatLogTime(entry.time)} ${entry.level} ${entry.source} - ${entry.message}`,
      entry.stack,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("로그를 복사했습니다");
    } catch {
      toast.error("복사하지 못했습니다");
    }
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="bg-thead text-muted-foreground flex h-8 shrink-0 items-center border-b pr-1.5 pl-4 text-xs font-medium">
        <span className="flex-1">로그 상세</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="상세 닫기"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4 py-3.5">
        <dl className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-2">
          <dt className="text-muted-foreground">시각</dt>
          <dd className="font-mono text-xs leading-5">
            {formatLogTime(entry.time)}
          </dd>
          <dt className="text-muted-foreground">수준</dt>
          <dd>
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[11px] font-semibold",
                LEVEL_BADGES[entry.level],
              )}
            >
              {entry.level}
            </Badge>
          </dd>
          <dt className="text-muted-foreground">출처</dt>
          <dd className="break-all">{entry.source}</dd>
        </dl>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">메시지</span>
          <p className="leading-relaxed break-words whitespace-pre-wrap">
            {entry.message}
          </p>
        </div>
        {entry.stack && (
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">스택 트레이스</span>
            <pre className="bg-muted/40 rounded-md border px-3 py-2.5 font-mono text-[11.5px] leading-relaxed break-words whitespace-pre-wrap">
              {entry.stack}
            </pre>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            복사
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSource(entry.source)}
          >
            이 출처만 보기
          </Button>
        </div>
      </div>
    </div>
  );
}
