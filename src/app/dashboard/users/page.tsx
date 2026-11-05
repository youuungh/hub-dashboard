import { ListPageShell } from "@/components/layout/list-page-shell";
import UserListingPage from "@/features/users/components/user-listing";
import { searchParamsCache } from "@/lib/searchparams";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

export const metadata = {
  title: "사용자 | Hub Admin",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  // key 없음, 조건마다 재마운트되면 표가 깜빡임
  return (
    <ListPageShell title="사용자">
      <Suspense>
        <UserListingPage />
      </Suspense>
    </ListPageShell>
  );
}
