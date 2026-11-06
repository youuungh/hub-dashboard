import { useSyncExternalStore } from "react";
import { KBarResults, useMatches } from "kbar";
import { useMediaQuery } from "@/hooks/use-media-query";
import ResultItem from "./result-item";

// globals.css desk와 같아야 함
const DESK_QUERY = "(width >= 48rem) and (height >= 31.25rem)";
const MAX_HEIGHT = 400;
// 창 위 여백, index.tsx 위치와 같아야 함
const DESK_TOP = 112;
const MOBILE_TOP = 12;
// 검색칸·테두리·아래 여백
const FRAME = 65;

function subscribeViewport(onChange: () => void) {
  window.addEventListener("resize", onChange);
  window.visualViewport?.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.visualViewport?.removeEventListener("resize", onChange);
  };
}

const viewportHeight = () =>
  Math.round(window.visualViewport?.height ?? window.innerHeight);

export default function RenderResults() {
  const { results, rootActionId } = useMatches();
  const desk = useMediaQuery(DESK_QUERY);
  // 키보드가 올라와 화면이 줄면 목록도 남는 높이까지만
  const height = useSyncExternalStore(
    subscribeViewport,
    viewportHeight,
    () => 0,
  );
  const maxHeight = height
    ? Math.min(MAX_HEIGHT, height - (desk ? DESK_TOP : MOBILE_TOP) - FRAME)
    : MAX_HEIGHT;

  return (
    <KBarResults
      items={results}
      maxHeight={maxHeight}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="text-muted-foreground px-4 pt-2.5 pb-1 text-xs">
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ""}
          />
        )
      }
    />
  );
}
