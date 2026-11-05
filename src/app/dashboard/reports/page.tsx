import { ListPageShell } from "@/components/layout/list-page-shell";
import ReportListingPage from "@/features/reports/components/report-listing";

export const metadata = {
  title: "신고 관리 | Hub Admin",
};

// 목록이 직접 로딩을 그려 Suspense 없이 렌더
export default function Page() {
  return (
    <ListPageShell title="신고 관리">
      <ReportListingPage />
    </ListPageShell>
  );
}
