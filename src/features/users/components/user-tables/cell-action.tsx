"use client";

import { useState } from "react";
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
import { UserMinus } from "lucide-react";
import { demoteCreator } from "@/lib/api/creators";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api/client";

interface User {
  id: number;
  username: string;
  role: "USER" | "CREATOR" | "ADMIN";
}

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [demoteDialogOpen, setDemoteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDemote = async () => {
    try {
      setActionLoading(true);
      await demoteCreator(data.id);
      toast.success(`${data.username} 님을 일반 사용자로 강등했습니다`);
      setDemoteDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creatorApplications,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) || "크리에이터 강등에 실패했습니다",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (data.role !== "CREATOR") {
    return <div className="w-9 h-9" />;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDemoteDialogOpen(true)}
        disabled={actionLoading}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <UserMinus className="mr-1 h-4 w-4" />
        강등
      </Button>

      <AlertDialog open={demoteDialogOpen} onOpenChange={setDemoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>크리에이터 강등</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{data.username}</strong> 님을 일반 사용자로 강등할까요?
              크리에이터 권한이 모두 해제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>취소</AlertDialogCancel>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDemote}
              disabled={actionLoading}
            >
              {actionLoading ? "강등 중..." : "강등"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
