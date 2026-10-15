"use client";

import type { ReactNode } from "react";

// 표 본문만 스크롤, 제목은 고정
export function ListPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden px-4 pt-28 pb-4 md:px-6">
      <div className="shrink-0 pb-5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
