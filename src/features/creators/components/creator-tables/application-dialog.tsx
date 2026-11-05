"use client";

import { useState, type ReactNode } from "react";
import { parseServerDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";
import type { CreatorApplication } from "@/types/user";
import { ExternalLink } from "lucide-react";
import { STATUS_LABELS, getStatusBadgeColor } from "./options";

const FULL = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right">{children}</span>
    </div>
  );
}

// 신청 사유를 누르면 신청 내용 전체
export function ApplicationDialog({ data }: { data: CreatorApplication }) {
  const [open, setOpen] = useState(false);
  const revoked = data.status === "REVOKED";

  return (
    <>
      <button
        type="button"
        className="text-muted-foreground block w-full cursor-pointer truncate text-left text-sm transition-opacity hover:opacity-80"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {data.reason}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">
            {data.username} 크리에이터 신청
          </DialogTitle>

          <div className="flex flex-col items-center gap-3 pt-2">
            <UserAvatar src={data.avatarUrl} className="size-20" />
            <div className="text-center">
              <p className="text-lg font-semibold">{data.username}</p>
              <p className="text-muted-foreground text-xs">
                사용자 #{data.userId} · 신청 #{data.id}
              </p>
            </div>
            <Badge
              variant="outline"
              className={getStatusBadgeColor(data.status)}
            >
              {STATUS_LABELS[data.status] ?? data.status}
            </Badge>
          </div>

          <Separator />

          <div className="divide-border/60 divide-y">
            <Row label="신청일">
              {FULL.format(parseServerDate(data.createdAt))}
            </Row>
            <Row label="처리일">
              {data.reviewedAt ? (
                FULL.format(parseServerDate(data.reviewedAt))
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </Row>
            <Row label="포트폴리오">
              {data.portfolioUrl ? (
                <a
                  href={data.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  링크 열기
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </Row>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-sm">신청 사유</p>
            <p className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {data.reason}
            </p>
          </div>

          {data.rejectionReason && (
            <div className="space-y-1.5">
              {/* 해제 사유도 rejectionReason에 담김 */}
              <p className="text-muted-foreground text-sm">
                {revoked ? "해제 사유" : "반려 사유"}
              </p>
              <p
                className={cn(
                  "rounded-lg p-3 text-sm leading-relaxed break-words whitespace-pre-wrap",
                  revoked
                    ? "bg-muted/50"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {data.rejectionReason}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
