"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { DEFAULT_PAGE_SIZE, selectFilterParser } from "@/hooks/use-data-table";
import { getSortingStateParser } from "@/lib/parsers";
import { getCreatorApplications } from "@/lib/api/creators";
import { queryKeys } from "@/lib/query-keys";
import type { CreatorApplication } from "@/types/user";
import { CreatorTable } from "./creator-tables";
import { columns } from "./creator-tables/columns";

const EMPTY: CreatorApplication[] = [];

// 클라이언트에서 Bearer로 로드
export default function CreatorListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );
  const [creatorUsername] = useQueryState("creatorUsername", parseAsString);
  const [statuses] = useQueryState("status", selectFilterParser);
  const status = statuses?.[0];
  // 표가 쓰는 파서와 같아야 화면 안에서 바꾼 정렬이 그대로 넘어옴
  const [sorting] = useQueryState(
    "sort",
    // 열 id는 화면 기준이라 행 타입 키와 다를 수 있음
    getSortingStateParser<Record<string, unknown>>(),
  );
  const sort = sorting?.[0];

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [
      ...queryKeys.creatorApplications,
      { page, perPage, status, creatorUsername, sort },
    ],
    queryFn: () => {
      // 첫 컬럼 id만 creatorUsername이라 username으로
      const sortBy = sort?.id === "creatorUsername" ? "username" : sort?.id;
      const sortOrder = sort ? (sort.desc ? "desc" : "asc") : undefined;

      return getCreatorApplications(
        status || undefined,
        page,
        perPage,
        creatorUsername || undefined,
        sortBy,
        sortOrder,
      );
    },
    // 새 응답이 올 때까지 이전 행 유지
    placeholderData: keepPreviousData,
    meta: { errorMessage: "크리에이터 신청 목록을 불러오지 못했습니다" },
  });

  return (
    <CreatorTable
      data={data?.items ?? EMPTY}
      totalItems={data?.totalCount ?? 0}
      totalPages={data?.totalPages ?? 0}
      columns={columns}
      loading={isPending}
      stale={isPlaceholderData}
    />
  );
}
