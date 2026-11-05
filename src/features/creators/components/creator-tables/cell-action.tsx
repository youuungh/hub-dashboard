"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import {
  approveCreatorApplication,
  rejectCreatorApplication,
} from "@/lib/api/creators";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api/client";

interface CreatorApplication {
  id: number;
  userId: number;
  username: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
}

interface CellActionProps {
  data: CreatorApplication;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveCreatorApplication(data.id);
      toast.success(`${data.username} 신청이 승인되었습니다`);
      setApproveDialogOpen(false);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creatorApplications,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "신청 승인에 실패했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error("거부 사유를 입력해주세요");
      return;
    }

    try {
      setActionLoading(true);
      await rejectCreatorApplication(data.id, rejectionReason);
      toast.success(`${data.username} 신청이 거부되었습니다`);
      setRejectDialogOpen(false);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creatorApplications,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "신청 거부에 실패했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  if (data.status !== "PENDING") {
    return <div className="w-[88px] h-9" />;
  }

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setApproveDialogOpen(true)}
          disabled={actionLoading}
          className="text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Check className="mr-1 h-4 w-4" />
          승인
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRejectDialogOpen(true)}
          disabled={actionLoading}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="mr-1 h-4 w-4" />
          반려
        </Button>
      </div>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>신청 승인</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{data.username}</strong> 님의 크리에이터 신청을
              승인할까요? 승인하면 크리에이터 권한이 부여됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>취소</AlertDialogCancel>
            <Button
              size="sm"
              variant="default"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? "승인 중..." : "승인"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent
          // 사유부터 쓰도록 취소 버튼 대신 입력칸에 포커스
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            reasonRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>신청 반려</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{data.username}</strong> 님의 크리에이터 신청을 반려할
              사유를 입력하세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-5 pb-4">
            <Textarea
              ref={reasonRef}
              placeholder="반려 사유..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>취소</AlertDialogCancel>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? "반려 중..." : "반려"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
