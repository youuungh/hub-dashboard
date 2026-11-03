"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { DEFAULT_PAGE_SIZE } from "@/hooks/use-data-table";
import { getAdminPosts } from "@/lib/api/posts";
import { queryKeys } from "@/lib/query-keys";
import type { AdminPost } from "@/types/post";
import { PostTable } from "./post-tables";
import { columns } from "./post-tables/columns";

const EMPTY: AdminPost[] = [];

// 클라이언트에서 Bearer로 로드
export default function PostListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.posts, { page, perPage }],
    queryFn: () => getAdminPosts(page, perPage),
    // 새 응답이 올 때까지 이전 행 유지
    placeholderData: keepPreviousData,
    meta: { errorMessage: "포스트 목록을 불러오지 못했습니다" },
  });

  return (
    <PostTable
      data={data?.items ?? EMPTY}
      pageCount={data?.totalPages ?? 0}
      totalCount={data?.totalCount ?? 0}
      columns={columns}
      loading={isPending}
      stale={isPlaceholderData}
    />
  );
}
