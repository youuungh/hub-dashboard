"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EyeOff, Eye } from "lucide-react";
import { blindTarget, unblindTarget } from "@/lib/api/reports";
import { getApiErrorMessage } from "@/lib/api/client";
import type { ReportedTarget } from "@/types/report";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const TYPE_LABELS: Record<ReportedTarget["targetType"], string> = {
  POST: "포스트",
  COMMENT: "댓글",
  USER: "사용자",
};

interface CellActionProps {
  data: ReportedTarget;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const queryClient = useQueryClient();

  // 사용자는 블라인드 불가, 신고 누적만 확인
  if (data.targetType === "USER") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground text-xs">—</span>
          </TooltipTrigger>
          <TooltipContent>사용자는 블라인드 대상이 아닙니다</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const label = data.isBlinded ? "해제" : "블라인드";

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      if (data.isBlinded) {
        await unblindTarget(data.targetType, data.targetId);
        toast.success(`#${data.targetId} 블라인드를 해제했습니다`);
      } else {
        await blindTarget(data.targetType, data.targetId);
        toast.success(`#${data.targetId}를 숨겼습니다`);
      }
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || `${label} 처리에 실패했습니다`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className={
          data.isBlinded
            ? "text-primary hover:bg-primary/10 hover:text-primary"
            : "text-destructive hover:bg-destructive/10 hover:text-destructive"
        }
      >
        {data.isBlinded ? (
          <Eye className="mr-1 h-4 w-4" />
        ) : (
          <EyeOff className="mr-1 h-4 w-4" />
        )}
        {label}
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {TYPE_LABELS[data.targetType]} #{data.targetId}를 {label}{" "}
              처리할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {data.isBlinded
                ? "대상이 다시 공개됩니다. 해제한 대상은 이후 신고가 쌓여도 자동 블라인드가 적용되지 않습니다."
                : "대상이 즉시 숨겨집니다. 작성자와 다른 사용자에게 더 이상 보이지 않습니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "처리 중..." : label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
