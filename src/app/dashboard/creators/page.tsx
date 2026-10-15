import { ListPageShell } from "@/components/layout/list-page-shell";
import CreatorListingPage from "@/features/creators/components/creator-listing";
import { searchParamsCache } from "@/lib/searchparams";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

export const metadata = {
  title: "크리에이터 신청 | Hub Admin",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  // key 없음, 조건마다 재마운트되면 표가 깜빡임
  return (
    <ListPageShell
      title="크리에이터 신청"
      description="크리에이터 신청을 검토하고 승인하거나 반려합니다."
    >
      <Suspense>
        <CreatorListingPage />
      </Suspense>
    </ListPageShell>
  );
}
