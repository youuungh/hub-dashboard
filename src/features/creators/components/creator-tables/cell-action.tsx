"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  // PENDING이 아니면 빈 공간
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

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>신청 승인</DialogTitle>
            <DialogDescription>
              <strong>{data.username}</strong> 님의 크리에이터 신청을
              승인할까요? 승인하면 크리에이터 권한이 부여됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={actionLoading}
            >
              취소
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? "승인 중..." : "승인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>신청 반려</DialogTitle>
            <DialogDescription>
              <strong>{data.username}</strong> 님의 크리에이터 신청을 반려할
              사유를 입력하세요. 신청자에게 그대로 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="반려 사유..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={actionLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? "반려 중..." : "반려"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
