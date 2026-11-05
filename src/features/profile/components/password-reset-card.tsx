"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  resetPassword as requestPasswordReset,
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from "@/lib/api/auth";
import { cn } from "@/lib/utils";

type Step = "request" | "verify" | "reset";

const STEPS: { key: Step; label: string }[] = [
  { key: "request", label: "인증 코드 받기" },
  { key: "verify", label: "인증 코드 확인" },
  { key: "reset", label: "새 비밀번호" },
];

const CODE_LENGTH = 6;
const MIN_PASSWORD = 8;

// 메일 코드 확인 뒤 새 비밀번호, 바꾸면 모든 기기 로그아웃
export function PasswordResetCard({ email }: { email: string }) {
  const [step, setStep] = useState<Step>("request");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const current = STEPS.findIndex((s) => s.key === step);

  const cancel = () => {
    setStep("request");
    setCode("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const sendCode = async () => {
    try {
      setLoading(true);
      await sendPasswordResetCode(email);
      toast.success("인증 코드를 메일로 보냈습니다");
      setStep("verify");
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "인증 코드 발송에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setResetToken(
        await verifyPasswordResetCode(email, code.trim().toUpperCase()),
      );
      setStep("reset");
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "인증 코드 확인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 서로 다릅니다");
      return;
    }
    try {
      setLoading(true);
      await requestPasswordReset(resetToken, newPassword);
      toast.success("비밀번호를 변경했습니다. 다시 로그인해 주세요");
      cancel();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "비밀번호 변경에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const action =
    step === "request"
      ? {
          label: loading ? "전송 중..." : "인증 코드 받기",
          run: sendCode,
          ok: true,
        }
      : step === "verify"
        ? {
            label: loading ? "확인 중..." : "확인",
            run: verifyCode,
            ok: code.trim().length === CODE_LENGTH,
          }
        : {
            label: loading ? "변경 중..." : "비밀번호 변경",
            run: resetPassword,
            ok: newPassword.length >= MIN_PASSWORD,
          };

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-3">
        <CardTitle>비밀번호 변경</CardTitle>
      </CardHeader>
      <ol
        className="flex flex-wrap items-center gap-2 border-b px-4 py-3"
        aria-label="진행 단계"
      >
        {STEPS.map((s, index) => (
          <li key={s.key} className="flex items-center gap-2">
            {index > 0 && <span className="bg-border h-px w-6" />}
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs",
                index > current && "text-muted-foreground",
                index === current && "font-medium",
              )}
            >
              <span
                className={cn(
                  "flex size-[18px] items-center justify-center rounded-full border text-[11px] font-semibold",
                  index < current && "bg-muted border-transparent",
                  index === current &&
                    "bg-primary text-primary-foreground border-primary",
                )}
              >
                {index < current ? <Check className="size-3" /> : index + 1}
              </span>
              {s.label}
            </span>
          </li>
        ))}
      </ol>
      <CardContent className="space-y-3 py-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="reset-email">이메일</Label>
          <Input
            id="reset-email"
            value={email}
            readOnly
            className="text-muted-foreground border-dashed bg-transparent dark:bg-transparent"
          />
        </div>

        {step === "verify" && (
          <div className="space-y-1.5">
            <Label htmlFor="reset-code">인증 코드</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="reset-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                maxLength={CODE_LENGTH}
                placeholder="ABC123"
                className="min-w-40 flex-1 font-semibold tracking-[0.2em] uppercase"
              />
              <Button
                variant="outline"
                className="h-[30px]"
                onClick={sendCode}
                disabled={loading}
              >
                다시 보내기
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              인증 코드를 메일로 보냈습니다 · 5분 안에 입력하세요
            </p>
          </div>
        )}

        {step === "reset" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="8자 이상"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="8자 이상"
              />
            </div>
          </div>
        )}
      </CardContent>
      <div className="bg-band flex justify-end gap-2 rounded-b-lg border-t px-4 py-2.5">
        {step !== "request" && (
          <Button
            variant="outline"
            size="sm"
            onClick={cancel}
            disabled={loading}
          >
            취소
          </Button>
        )}
        <Button size="sm" onClick={action.run} disabled={loading || !action.ok}>
          {action.label}
        </Button>
      </div>
    </Card>
  );
}
