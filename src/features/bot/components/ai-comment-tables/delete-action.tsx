"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { deleteBotAiComment } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";
import type { BotAiComment } from "@/types/bot";

export function DeleteAction({ data }: { data: BotAiComment }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const remove = useMutation({
    mutationFn: () => deleteBotAiComment(data.commentId),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.bot });
      toast.success("댓글을 지웠습니다");
    },
    onError: () => toast.error("댓글을 지우지 못했습니다"),
  });

  if (data.isDeleted) {
    return <span className="text-muted-foreground text-sm">지워짐</span>;
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-3.5" />
        지우기
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {data.authorName}의 댓글을 지울까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              「{data.content}」
              <br />
              작성자가 직접 지운 것과 똑같이 처리됩니다. 답글이 달려 있으면
              &quot;삭제된 댓글&quot; 자리만 남습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                remove.mutate();
              }}
            >
              지우기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
