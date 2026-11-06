import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/sonner";
import { fontVariables } from "@/lib/font";
import ThemeProvider from "@/components/layout/theme/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const META_THEME_COLORS = {
  light: "#fcfcfc",
  dark: "#121212",
};

export const metadata: Metadata = {
  title: "Hub Admin",
  description: "Hub 플랫폼 관리자 대시보드",
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
  // 키보드가 올라오면 화면 높이를 줄여 창이 가려지지 않게
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("bg-background font-sans antialiased", fontVariables)}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
