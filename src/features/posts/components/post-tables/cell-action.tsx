"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { EyeOff, Eye } from "lucide-react";
import { blindTarget, unblindTarget } from "@/lib/api/reports";
import { getApiErrorMessage } from "@/lib/api/client";
import type { AdminPost } from "@/types/post";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface CellActionProps {
  data: AdminPost;
}

// 신고 관리와 같은 API, 신고 없어도 숨김 가능
export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const queryClient = useQueryClient();

  const hidden = !data.isActive;
  const label = hidden ? "해제" : "블라인드";

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      if (hidden) {
        await unblindTarget("POST", data.id);
        toast.success(`#${data.id} 블라인드를 해제했습니다`);
      } else {
        await blindTarget("POST", data.id);
        toast.success(`#${data.id}를 숨겼습니다`);
      }
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports });
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
          hidden
            ? "text-primary hover:bg-primary/10 hover:text-primary"
            : "text-destructive hover:bg-destructive/10 hover:text-destructive"
        }
      >
        {hidden ? (
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
              포스트 #{data.id}를 {label} 처리할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hidden
                ? "포스트가 다시 공개됩니다. 해제한 포스트는 이후 신고가 쌓여도 자동 블라인드가 적용되지 않습니다."
                : "포스트가 즉시 숨겨집니다. 작성자와 다른 사용자에게 더 이상 보이지 않습니다."}
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
              className={cn(
                !hidden &&
                  buttonVariants({ variant: "destructive", size: "sm" }),
              )}
            >
              {actionLoading ? "처리 중..." : label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
