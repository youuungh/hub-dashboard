"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      /** 조회 실패 토스트 문구, 없으면 화면이 표시 */
      errorMessage?: string;
    };
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          // 보여줄 데이터가 없을 때만 알림
          onError: (error, query) => {
            const fallback = query.meta?.errorMessage;
            if (fallback && query.state.data === undefined) {
              toast.error(getApiErrorMessage(error) || fallback);
            }
          },
        }),
        defaultOptions: { queries: { retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
