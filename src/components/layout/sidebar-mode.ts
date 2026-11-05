export type SidebarMode = "expanded" | "collapsed" | "hover";

export const SIDEBAR_MODE_COOKIE = "sidebar_mode";

export const SIDEBAR_MODE_LABELS: Record<SidebarMode, string> = {
  expanded: "펼침",
  collapsed: "접힘",
  hover: "올리면 펼침",
};

export function parseSidebarMode(value: string | undefined): SidebarMode {
  return value === "collapsed" || value === "hover" ? value : "expanded";
}
