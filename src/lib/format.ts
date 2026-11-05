// 멤버십 티어 표시 이름, 앱 멤버십 화면과 같게. FREE는 표시 안 함
export function tierLabel(tier: string): string {
  if (tier === "TIER1") return "Tier 1";
  if (tier === "TIER2") return "Tier 2";
  return tier;
}

// 서버의 존 없는 UTC 문자열을 UTC로 읽음
export function parseServerDate(value: string): Date {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return "";
  }
}
