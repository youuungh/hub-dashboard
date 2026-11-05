import AuthGuard from "@/components/auth-guard";
import KBar from "@/components/kbar";
import { PageTransition } from "@/components/motion/page-transition";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import {
  SIDEBAR_MODE_COOKIE,
  parseSidebarMode,
} from "@/components/layout/sidebar-mode";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Hub Admin Dashboard",
  description: "Hub 플랫폼 관리자 대시보드",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarMode = parseSidebarMode(
    cookieStore.get(SIDEBAR_MODE_COOKIE)?.value,
  );

  return (
    <AuthGuard>
      <KBar>
        <NextTopLoader color="#71717a" showSpinner={false} height={2} />
        <div className="flex h-dvh flex-col">
          <Header />
          <div className="flex min-h-0 flex-1">
            <AppSidebar defaultMode={sidebarMode} />
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>
      </KBar>
    </AuthGuard>
  );
}
