import type { ActionId, ActionImpl } from "kbar";
import * as React from "react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl;
      active: boolean;
      currentRootActionId: ActionId;
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId,
      );
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    // 아이콘은 사이드바와 같은 이름으로 넘어옴
    const Icon =
      typeof action.icon === "string"
        ? Icons[action.icon as keyof typeof Icons]
        : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "mx-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-[13px]",
          active && "bg-accent text-accent-foreground",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <Icon
              className="text-muted-foreground size-4 shrink-0 -translate-y-px"
              stroke={1.75}
            />
          )}
          <div className="flex min-w-0 flex-col">
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <React.Fragment key={ancestor.id}>
                    <span className="text-muted-foreground mr-2">
                      {ancestor.name}
                    </span>
                    <span className="mr-2">&rsaquo;</span>
                  </React.Fragment>
                ))}
              <span>{action.name}</span>
            </div>
            {action.subtitle && (
              <span className="text-muted-foreground text-xs">
                {action.subtitle}
              </span>
            )}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div className="grid grid-flow-col gap-1">
            {action.shortcut.map((sc, i) => (
              <kbd
                key={sc + i}
                className="bg-muted flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium"
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);

ResultItem.displayName = "KBarResultItem";

export default ResultItem;
