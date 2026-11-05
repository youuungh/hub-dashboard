"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import PageContainer from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectFilterParser } from "@/hooks/use-data-table";
import { getBotSummary } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";
import { AiCommentTable } from "./ai-comment-tables";
import { JobTable } from "./job-tables";
import { OverviewTab } from "./overview-tab";
import { ScheduleTab } from "./schedule-tab";

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

  return (
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
      className="min-h-0 flex-1 gap-0"
    >
      <div className="flex shrink-0 flex-col gap-2 px-4 pt-5 md:px-6">
        <h1 className="text-xl font-semibold tracking-tight">자동화</h1>
        <TabsList className="shadow-none">
          <TabsTrigger value="overview">현황</TabsTrigger>
          <TabsTrigger value="schedule">일정표</TabsTrigger>
          <TabsTrigger value="jobs">작업 기록</TabsTrigger>
          <TabsTrigger value="ai">AI 글</TabsTrigger>
        </TabsList>
      </div>

      {/* 현황은 페이지 전체 스크롤, 나머지 탭은 표·목록 안쪽만 스크롤 */}
      <TabsContent value="overview" className="flex min-h-0 flex-col border-t">
        <PageContainer>
          <OverviewTab summary={summary} />
        </PageContainer>
      </TabsContent>
      <TabsContent value="schedule" className="flex min-h-0 flex-col">
        <ScheduleTab />
      </TabsContent>
      <TabsContent value="jobs" className="flex min-h-0 flex-col">
        <JobTable />
      </TabsContent>
      <TabsContent value="ai" className="flex min-h-0 flex-col">
        <AiCommentTable />
      </TabsContent>
    </Tabs>
  );
}
