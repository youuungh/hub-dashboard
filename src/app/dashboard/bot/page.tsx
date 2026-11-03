import PageContainer from "@/components/layout/page-container";
import BotView from "@/features/bot/components/bot-view";

export const metadata = {
  title: "자동화 | Hub Admin",
};

export default function Page() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">자동화</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            예약 게시와 댓글·반응 작업이 제때 돌고 있는지 확인합니다.
          </p>
        </div>
        <BotView />
      </div>
    </PageContainer>
  );
}
