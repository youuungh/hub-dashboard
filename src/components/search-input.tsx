"use client";
import { useSyncExternalStore } from "react";
import { useKBar } from "kbar";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "./ui/button";

const noop = () => () => {};
// kbar 단축키는 맥이면 ⌘, 그 외 Ctrl
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

export default function SearchInput() {
  const { query } = useKBar();
  const mac = useSyncExternalStore(noop, isMac, () => false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="검색"
        className="text-muted-foreground md:hidden"
        onClick={query.toggle}
      >
        <IconSearch />
      </Button>
      <Button
        variant="outline"
        className="bg-card text-muted-foreground hidden h-7 w-[200px] justify-between md:flex gap-2.5 rounded-full pr-1.5 pl-2.5 text-xs font-normal shadow-none active:scale-100"
        onClick={query.toggle}
      >
        <span className="flex items-center gap-2">
          <IconSearch className="size-3.5" />
          검색…
        </span>
        <kbd className="text-muted-foreground pointer-events-none hidden h-5 items-center px-1 font-sans text-[11px] select-none sm:flex">
          {mac ? "⌘ K" : "Ctrl K"}
        </kbd>
      </Button>
    </>
  );
}
