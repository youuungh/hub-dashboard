export function isMemoryWarning(percent: number): boolean {
  return percent >= 90;
}

export function isCpuWarning(percent: number): boolean {
  return percent >= 90;
}

export function isConnectionWarning(percent: number): boolean {
  return percent >= 90;
}

/** 주간 평균 대비 오늘 값 증감률 */
export function calculateWeeklyChangeRate(
  today: number,
  weekly: number,
): number | null {
  if (!weekly || weekly === 0) return null;
  const weeklyAverage = weekly / 7;
  if (weeklyAverage === 0) return null;
  return ((today - weeklyAverage) / weeklyAverage) * 100;
}
