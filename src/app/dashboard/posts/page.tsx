import { ListPageShell } from "@/components/layout/list-page-shell";
import PostListingPage from "@/features/posts/components/post-listing";

export const metadata = {
  title: "포스트 | Hub Admin",
};

export default function Page() {
  return (
    <ListPageShell title="포스트">
      <PostListingPage />
    </ListPageShell>
  );
}
