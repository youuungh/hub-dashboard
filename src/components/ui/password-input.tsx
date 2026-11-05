"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// 보기 버튼은 늘 보이고, 칸을 다 지우면 다시 가림
function PasswordInput({
  className,
  disabled,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [shown, setShown] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={shown ? "text" : "password"}
        disabled={disabled}
        // Edge 자체 보기 버튼과 겹치지 않게
        className={cn("pr-10 [&::-ms-reveal]:hidden", className)}
        onChange={(event) => {
          onChange?.(event);
          if (!event.target.value) setShown(false);
        }}
      />
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? "비밀번호 숨기기" : "비밀번호 보기"}
        aria-pressed={shown}
        disabled={disabled}
        className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/15 absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
