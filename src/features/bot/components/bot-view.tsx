"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
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

  const header = (
    <div className="flex shrink-0 flex-col gap-2 px-4 pt-5 md:px-6">
      <h1 className="text-xl font-semibold tracking-tight">자동화</h1>
      <TabsList className="shadow-none">
        <TabsTrigger value="overview">현황</TabsTrigger>
        <TabsTrigger value="schedule">일정표</TabsTrigger>
        <TabsTrigger value="jobs">작업 기록</TabsTrigger>
        <TabsTrigger value="ai">AI 글</TabsTrigger>
      </TabsList>
    </div>
  );

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
      {tab !== "overview" && header}

      {/* 현황은 페이지 전체 스크롤, 나머지 탭은 표·목록 안쪽만 스크롤 */}
      <TabsContent value="overview" className="flex min-h-0 flex-col">
        {/* 제목·탭을 스크롤 안 맨 위에 붙여 지나가는 카드가 흐리게 비치게, 막대는 숨김 */}
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="bg-background/75 sticky top-0 z-10 border-b backdrop-blur-xl backdrop-saturate-150">
            {header}
          </div>
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-6 pb-12 md:px-6">
            <OverviewTab summary={summary} />
          </div>
        </div>
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
