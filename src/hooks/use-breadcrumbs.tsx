"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "대시보드",
  overview: "개요",
  users: "사용자",
  creators: "크리에이터 신청",
  posts: "포스트",
  reports: "신고 관리",
  profile: "프로필",
  security: "보안",
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        title:
          SEGMENT_LABELS[segment] ??
          segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
