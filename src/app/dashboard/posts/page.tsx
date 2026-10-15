import { ListPageShell } from "@/components/layout/list-page-shell";
import PostListingPage from "@/features/posts/components/post-listing";

export const metadata = {
  title: "포스트 | Hub Admin",
};

export default function Page() {
  return (
    <ListPageShell
      title="포스트"
      description="전체 포스트를 확인하고 필요하면 블라인드 처리합니다."
    >
      <PostListingPage />
    </ListPageShell>
  );
}
