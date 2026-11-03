"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { retryBotJob } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";

export function RetryAction({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const retry = useMutation({
    mutationFn: () => retryBotJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bot });
      toast.success("다시 실행하도록 넣었습니다");
    },
    onError: () => toast.error("다시 실행하지 못했습니다"),
  });

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-primary hover:bg-primary/10 hover:text-primary"
      disabled={retry.isPending}
      onClick={() => retry.mutate()}
    >
      <RotateCcw className="mr-1 h-4 w-4" />
      다시 하기
    </Button>
  );
}
