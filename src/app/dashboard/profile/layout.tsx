import PageContainer from "@/components/layout/page-container";
import { SettingsTabs } from "@/features/profile/components/settings-tabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-2 border-b px-4 pt-5 md:px-6">
        <h1 className="text-xl font-semibold tracking-tight">계정 설정</h1>
        <SettingsTabs />
      </div>
      <PageContainer className="max-w-[760px]">{children}</PageContainer>
    </div>
  );
}
