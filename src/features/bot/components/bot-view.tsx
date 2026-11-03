"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    status: parseAsString,
    group: parseAsString,
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
      className="space-y-4"
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
      <TabsContent value="schedule">
        <ScheduleTab />
      </TabsContent>
      <TabsContent value="jobs">
        <JobTable />
      </TabsContent>
      <TabsContent value="ai" className="space-y-3">
        <p className="text-muted-foreground text-sm">
          AI가 쓴 팬 댓글과 크리에이터 답글입니다. 어색한 글은 바로 지울 수
          있습니다.
        </p>
        <AiCommentTable />
      </TabsContent>
    </Tabs>
  );
}
