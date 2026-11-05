"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { DEFAULT_PAGE_SIZE, selectFilterParser } from "@/hooks/use-data-table";
import { getSortingStateParser } from "@/lib/parsers";
import { getUsers } from "@/lib/api/users";
import type { UserSummary } from "@/types/user";
import { queryKeys } from "@/lib/query-keys";
import { UserTable } from "./user-tables";
import { columns } from "./user-tables/columns";

const EMPTY: UserSummary[] = [];

// 클라이언트에서 Bearer로 로드
export default function UserListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );
  const [username] = useQueryState("username", parseAsString);
  const [roles] = useQueryState("role", selectFilterParser);
  const role = roles?.[0];
  // 표가 쓰는 파서와 같아야 화면 안에서 바꾼 정렬이 그대로 넘어옴
  const [sorting] = useQueryState(
    "sort",
    // 열 id는 화면 기준이라 행 타입 키와 다를 수 있음
    getSortingStateParser<Record<string, unknown>>(),
  );
  const sort = sorting?.[0];

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.users, { page, perPage, role, username, sort }],
    queryFn: () => {
      // 서버는 소문자 컬럼명을 받음
      const sortBy = sort?.id.toLowerCase();
      const sortOrder = sort ? (sort.desc ? "desc" : "asc") : undefined;

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
