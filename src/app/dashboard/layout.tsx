import AuthGuard from "@/components/auth-guard";
import KBar from "@/components/kbar";
import { PageTransition } from "@/components/motion/page-transition";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthGuard>
      <KBar>
        <NextTopLoader color="#71717a" showSpinner={false} height={2} />
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset className="relative bg-transparent">
            <Header />
            <PageTransition>{children}</PageTransition>
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthGuard>
  );
}
