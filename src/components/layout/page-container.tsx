import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-6 pb-12 md:px-6",
          className,
        )}
      >
        {children}
      </div>
    </ScrollArea>
  );
}
