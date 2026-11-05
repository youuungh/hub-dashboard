"use client";

import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

// 색 바탕 작은 칸 안에 기호, Supabase 알림 아이콘과 같은 형태
function StatusIcon({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded-[3px] [&_svg]:size-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

// 오른쪽 위, 4초 뒤 닫힘, 올리면 닫기 버튼
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group pointer-events-auto"
      position="top-right"
      // 상단 바(48px) 아래로 띄워 검색창을 가리지 않게
      offset={{ top: 56, right: 16 }}
      mobileOffset={{ top: 56, right: 16, left: 16 }}
      style={{ fontFamily: "inherit" }}
      icons={{
        success: (
          <StatusIcon className="bg-foreground text-background">
            <CheckIcon strokeWidth={3} />
          </StatusIcon>
        ),
        info: (
          <StatusIcon className="bg-muted-foreground text-background">
            <InfoIcon strokeWidth={2.5} />
          </StatusIcon>
        ),
        warning: (
          <StatusIcon className="bg-amber-600 text-white">
            <TriangleAlertIcon strokeWidth={2.5} />
          </StatusIcon>
        ),
        error: (
          <StatusIcon className="bg-destructive text-white">
            <TriangleAlertIcon strokeWidth={2.5} />
          </StatusIcon>
        ),
        loading: (
          <Loader2Icon className="text-muted-foreground size-4 animate-spin" />
        ),
      }}
      toastOptions={{
        unstyled: true,
        duration: 4000,
        closeButton: true,
        classNames: {
          toast:
            "group toast bg-popover/70 text-foreground flex w-full items-center gap-2 rounded-md border px-5 py-3 text-sm shadow-lg backdrop-blur-xl backdrop-saturate-150",
          icon: "self-start mt-0.5",
          content: "grow",
          title: "font-normal",
          description: "text-muted-foreground text-xs",
          error:
            "border-red-300 bg-red-50/80 dark:border-red-900 dark:bg-red-950/60",
          warning:
            "border-amber-300 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/60",
          closeButton:
            "bg-popover text-foreground focus-visible:outline-ring absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 group-data-[type=error]:border-red-300 group-data-[type=error]:text-destructive dark:group-data-[type=error]:border-red-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
