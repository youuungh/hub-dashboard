"use client";

import { useState } from "react";
import { PanelHeader } from "@/components/panel-header";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { expireCoupons, expirePoints } from "@/lib/api/maintenance";
import { getApiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

type Job = "points" | "coupons";

const JOBS: Record<
  Job,
  {
    title: string;
    description: string;
    run: () => Promise<{ expiredCount: number }>;
  }
> = {
  points: {
    title: "포인트 만료 처리",
    description: "유효기간이 지난 적립 포인트를 소멸 처리합니다.",
    run: expirePoints,
  },
  coupons: {
    title: "쿠폰 만료 처리",
    description: "유효기간이 지난 발급 쿠폰을 만료 상태로 바꿉니다.",
    run: expireCoupons,
  },
};

// 서버가 자동 실행, 여기는 즉시 실행만
export function MaintenanceCard() {
  const [pending, setPending] = useState<Job | null>(null);
  const [running, setRunning] = useState(false);

  const handleConfirm = async () => {
    if (!pending) return;
    const job = JOBS[pending];
    try {
      setRunning(true);
      const result = await job.run();
      toast.success(`${job.title} 완료 — ${result.expiredCount}건 처리`);
      setPending(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || `${job.title}에 실패했습니다`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Card className="gap-0 py-0">
        <PanelHeader title="유지보수" />
        <div className="divide-y">
          {(Object.keys(JOBS) as Job[]).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{JOBS[key].title}</p>
                <p className="text-muted-foreground text-xs">
                  {JOBS[key].description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPending(key)}
                disabled={running}
              >
                실행
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending && JOBS[pending].title}를 지금 실행할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              대상 데이터가 즉시 만료 처리되며 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={running}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              disabled={running}
              className={buttonVariants({ variant: "destructive", size: "sm" })}
            >
              {running ? "실행 중..." : "실행"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
