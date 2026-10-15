export const STATUS_OPTIONS = [
  { label: "대기", value: "PENDING" },
  { label: "승인", value: "APPROVED" },
  { label: "반려", value: "REJECTED" },
  { label: "해제", value: "REVOKED" },
];

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map(({ label, value }) => [value, label]),
);

// REVOKED는 승인 뒤 권한이 해제된 신청
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "REJECTED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "REVOKED":
      return "text-muted-foreground font-normal";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
};
