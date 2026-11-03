"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { DEFAULT_PAGE_SIZE, selectFilterParser } from "@/hooks/use-data-table";
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
  const [sort] = useQueryState("sort", parseAsString);

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [
      ...queryKeys.creatorApplications,
      { page, perPage, status, creatorUsername, sort },
    ],
    queryFn: () => {
      // 첫 컬럼 id만 creatorUsername이라 username으로
      let sortBy: string | undefined;
      let sortOrder: string | undefined;
      if (sort) {
        try {
          const parsed = JSON.parse(sort) as { id: string; desc: boolean }[];
          if (parsed.length > 0) {
            sortBy =
              parsed[0].id === "creatorUsername" ? "username" : parsed[0].id;
            sortOrder = parsed[0].desc ? "desc" : "asc";
          }
        } catch {
          // 잘못된 sort는 무시하고 기본 정렬
        }
      }

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
