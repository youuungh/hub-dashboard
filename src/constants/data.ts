import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "대시보드",
    url: "/dashboard/overview",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "사용자",
    url: "/dashboard/users",
    icon: "user",
    shortcut: ["u", "u"],
    isActive: false,
    items: [],
  },
  {
    title: "크리에이터",
    url: "/dashboard/creators",
    icon: "userPen",
    shortcut: ["c", "c"],
    isActive: false,
    items: [],
  },
  {
    title: "포스트",
    url: "/dashboard/posts",
    icon: "post",
    shortcut: ["p", "p"],
    isActive: false,
    items: [],
  },
  {
    title: "신고 관리",
    url: "/dashboard/reports",
    icon: "warning",
    shortcut: ["r", "r"],
    isActive: false,
    items: [],
  },
];
