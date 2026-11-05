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
      return "font-normal";
    case "REJECTED":
    case "REVOKED":
      return "bg-muted text-muted-foreground border-transparent font-normal";
    default:
      return "bg-primary text-primary-foreground border-transparent";
  }
};
