import type { ReactNode } from "react";

// 표 본문만 스크롤, 제목은 고정
export function ListPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="shrink-0 px-4 pt-5 text-xl font-semibold tracking-tight md:px-6">
        {title}
      </h1>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
