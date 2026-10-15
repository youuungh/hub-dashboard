import { ListPageShell } from "@/components/layout/list-page-shell";
import ReportListingPage from "@/features/reports/components/report-listing";

export const metadata = {
  title: "신고 관리 | Hub Admin",
};

// 목록이 직접 로딩을 그려 Suspense 없이 렌더
export default function Page() {
  return (
    <ListPageShell
      title="신고 관리"
      description="신고가 누적된 대상을 확인하고 블라인드를 적용하거나 해제합니다."
    >
      <ReportListingPage />
    </ListPageShell>
  );
}
