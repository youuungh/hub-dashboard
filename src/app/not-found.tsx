"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
      <span className="from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent">
        404
      </span>
      <h2 className="font-heading my-2 text-2xl font-bold">
        페이지를 찾을 수 없습니다
      </h2>
      <p>
        요청하신 페이지가 없거나 주소가 변경되었습니다.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => router.back()} variant="default" size="lg">
          뒤로 가기
        </Button>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="ghost"
          size="lg"
        >
          홈으로
        </Button>
      </div>
    </div>
  );
}
