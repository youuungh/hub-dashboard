import { ListPageShell } from "@/components/layout/list-page-shell";
import LogView from "@/features/logs/components/log-view";

export const metadata = {
  title: "로그 | Hub Admin",
};

export default function Page() {
  return (
    <ListPageShell title="로그">
      <LogView />
    </ListPageShell>
  );
}
