// 카드 맨 위 제목 줄, 아래는 구분선
export function PanelHeader({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <h2 className="min-w-0 text-sm font-semibold">{title}</h2>
      {aside}
    </div>
  );
}
