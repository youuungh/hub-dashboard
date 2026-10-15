"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getTokenPayload, tokenStore } from "@/lib/token";

const ALLOWED_ROLES = ["ADMIN", "CREATOR"];

// 토큰·역할만 보는 UX 게이트, 실제 권한은 서버
// 만료된 access는 통과, 첫 호출에서 회전
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const payload = getTokenPayload();
    if (!payload?.role || !ALLOWED_ROLES.includes(payload.role)) {
      tokenStore.clear();
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
