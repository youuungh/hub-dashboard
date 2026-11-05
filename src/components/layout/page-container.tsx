import React from "react";
import { cn } from "@/lib/utils";

export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // 막대 자리를 늘 비워 둬서 내용이 길어져도 화면이 옆으로 밀리지 않게
    <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-6 pb-12 md:px-6",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
