// 멤버십 단계 표시 이름, FREE는 표시 안 함
export function tierLabel(tier: string): string {
  if (tier === "TIER1") return "1단계";
  if (tier === "TIER2") return "2단계";
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
