"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { ListPageShell } from "@/components/layout/list-page-shell";
import PageContainer from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectFilterParser } from "@/hooks/use-data-table";
import { getBotSummary } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";
import { AiCommentTable } from "./ai-comment-tables";
import { JobTable } from "./job-tables";
import { OverviewTab } from "./overview-tab";
import { ScheduleTab } from "./schedule-tab";

const TITLE = "자동화";
const DESCRIPTION = "예약 게시와 댓글·반응 작업이 제때 돌고 있는지 확인합니다.";

export default function BotView() {
  const { data: summary } = useQuery({
    queryKey: queryKeys.bot,
    queryFn: getBotSummary,
    refetchInterval: 30_000,
    meta: { errorMessage: "자동화 상태를 불러오는데 실패했습니다" },
  });

  // 탭을 옮기면 표의 쪽수·필터는 비움
  const [{ tab }, setParams] = useQueryStates({
    tab: parseAsString.withDefault("overview"),
    page: parseAsString,
    perPage: parseAsString,
    status: selectFilterParser,
    group: selectFilterParser,
  });

  const tabs = (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        setParams({
          tab: value === "overview" ? null : value,
          page: null,
          perPage: null,
          status: null,
          group: null,
        })
      }
      className="min-h-0 flex-1 gap-4"
    >
      <TabsList>
        <TabsTrigger value="overview">현황</TabsTrigger>
        <TabsTrigger value="schedule">일정표</TabsTrigger>
        <TabsTrigger value="jobs">작업 기록</TabsTrigger>
        <TabsTrigger value="ai">AI 글</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab summary={summary} />
      </TabsContent>
      <TabsContent value="schedule" className="flex min-h-0 flex-col">
        <ScheduleTab />
      </TabsContent>
      <TabsContent value="jobs" className="flex min-h-0 flex-col">
        <JobTable />
      </TabsContent>
      <TabsContent value="ai" className="flex min-h-0 flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          AI가 쓴 팬 댓글과 크리에이터 답글입니다. 어색한 글은 바로 지울 수
          있습니다.
        </p>
        <AiCommentTable />
      </TabsContent>
    </Tabs>
  );

  // 현황은 페이지 전체 스크롤, 나머지 탭은 표·목록 안쪽만 스크롤
  if (tab === "overview") {
    return (
      <PageContainer>
        <div className="pb-5">
          <h1 className="text-2xl font-bold tracking-tight">{TITLE}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{DESCRIPTION}</p>
        </div>
        {tabs}
      </PageContainer>
    );
  }

  return (
    <ListPageShell title={TITLE} description={DESCRIPTION}>
      {tabs}
    </ListPageShell>
  );
}
