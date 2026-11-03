import type { ReportTargetType } from "@/types/report";

export const queryKeys = {
  users: ["users"] as const,
  creatorApplications: ["creator-applications"] as const,
  posts: ["posts"] as const,
  reports: ["reports"] as const,
  reportTarget: (targetType: ReportTargetType, targetId: number) =>
    ["reports", "target", targetType, targetId] as const,
  profiles: ["profile"] as const,
  profile: (userId: number) => ["profile", userId] as const,
  me: ["me"] as const,
  devices: ["devices"] as const,
  statistics: ["statistics"] as const,
  monitoring: ["monitoring"] as const,
  bot: ["bot"] as const,
};
