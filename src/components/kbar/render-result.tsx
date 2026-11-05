import { KBarResults, useMatches } from "kbar";
import ResultItem from "./result-item";

export default function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
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
