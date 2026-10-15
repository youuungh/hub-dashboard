"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { getUsers } from "@/lib/api/users";
import type { UserSummary } from "@/types/user";
import { queryKeys } from "@/lib/query-keys";
import { UserTable } from "./user-tables";
import { columns } from "./user-tables/columns";

const EMPTY: UserSummary[] = [];

// 클라이언트에서 Bearer로 로드
export default function UserListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [username] = useQueryState("username", parseAsString);
  const [role] = useQueryState("role", parseAsString);
  const [sort] = useQueryState("sort", parseAsString);

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.users, { page, perPage, role, username, sort }],
    queryFn: () => {
      // 서버는 소문자 컬럼명을 받음
      let sortBy: string | undefined;
      let sortOrder: string | undefined;
      if (sort) {
        try {
          const parsed = JSON.parse(sort) as { id: string; desc: boolean }[];
          if (parsed.length > 0) {
            sortBy = parsed[0].id.replace(/([A-Z])/g, (m) => m.toLowerCase());
            sortOrder = parsed[0].desc ? "desc" : "asc";
          }
        } catch {}
      }

      return getUsers(
        page,
        perPage,
        role || undefined,
        username || undefined,
        sortBy,
        sortOrder,
      );
    },
    // 새 응답이 올 때까지 이전 행 유지
    placeholderData: keepPreviousData,
    meta: { errorMessage: "사용자 목록을 불러오지 못했습니다" },
  });

  return (
    <UserTable
      data={data?.items ?? EMPTY}
      totalItems={data?.totalCount ?? 0}
      totalPages={data?.totalPages ?? 0}
      columns={columns}
      loading={isPending}
      stale={isPlaceholderData}
    />
  );
}
