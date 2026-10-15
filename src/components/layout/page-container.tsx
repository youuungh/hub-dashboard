import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

// 본문만 헤더 높이만큼 내려 헤더 뒤로 흐려지게
export default function PageContainer({
  children,
  scrollable = true,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  const inner = (
    <div className="flex flex-1 flex-col px-4 pt-28 pb-10 md:px-6">
      {children}
    </div>
  );

  return scrollable ? (
    <ScrollArea className="h-dvh">{inner}</ScrollArea>
  ) : (
    <div className="flex h-dvh flex-col overflow-hidden">{inner}</div>
  );
}
