"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { getMyProfile } from "@/lib/api/users";
import { queryKeys } from "@/lib/query-keys";
import type { AuthMe } from "@/types/auth";
import type { MyProfile } from "@/types/user";

export type Me = AuthMe & MyProfile;

// 사이드바·프로필·보안 화면이 공유하는 내 정보
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async (): Promise<Me> => {
      const [auth, profile] = await Promise.all([getMe(), getMyProfile()]);
      return { ...auth, ...profile };
    },
  });
}
