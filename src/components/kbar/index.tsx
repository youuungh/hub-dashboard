"use client";
import { navItems } from "@/constants/data";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from "kbar";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import RenderResults from "./render-result";
import useThemeSwitching from "./use-theme-switching";

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    const navActions = navItems.flatMap((navItem) => {
      const baseAction =
        navItem.url !== "#"
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: "이동",
              icon: navItem.icon ? navItem.icon : undefined,
              perform: () => navigateTo(navItem.url),
            }
          : null;

      const childActions =
        navItem.items?.map((childItem) => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          perform: () => navigateTo(childItem.url),
        })) ?? [];

      return baseAction ? [baseAction, ...childActions] : childActions;
    });

    const profileAction = {
      id: "profileAction",
      name: "프로필",
      shortcut: ["p"],
      keywords: "profile settings account",
      section: "계정",
      icon: "user",
      perform: () => navigateTo("/dashboard/profile"),
    };

    return [...navActions, profileAction];
  }, [router]);

  return (
    <KBarProvider
      actions={actions}
      // 본문 스크롤이 없어 스크롤바 자리 보정이 레이아웃만 밀어냄
      options={{ disableScrollbarManagement: true }}
    >
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-99999 bg-black/10 px-4! py-0! backdrop-blur-md">
          {/* 모바일은 키보드 위에 다 보이게 위로 붙임 */}
          <KBarAnimator className="bg-popover text-popover-foreground relative mt-40! w-full max-w-[560px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg mobile:mt-3! mobile:translate-y-0!">
            <div className="border-border sticky top-0 z-10 border-b">
              <KBarSearch
                defaultPlaceholder="이동할 화면이나 명령 검색…"
                className="placeholder:text-muted-foreground w-full border-none bg-transparent px-4 py-3 text-sm outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden"
              />
            </div>
            <div className="max-h-[400px] pb-1.5">
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
