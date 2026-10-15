import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/features/profile/components/sidebar-nav";

const sidebarNavItems = [
  {
    title: "프로필",
    href: "/dashboard/profile",
  },
  {
    title: "보안",
    href: "/dashboard/profile/security",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <PageContainer>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">설정</h2>
        <p className="text-muted-foreground">계정 설정과 환경을 관리합니다</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </PageContainer>
  );
}
