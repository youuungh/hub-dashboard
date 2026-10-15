"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  resetPassword as requestPasswordReset,
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from "@/lib/api/auth";
import { toast } from "sonner";

type Step = "request" | "verify" | "reset";

const CODE_LENGTH = 6;
const MIN_PASSWORD = 8;

export function PasswordResetDialog({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("request");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    setOpen(false);
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
      close();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "비밀번호 변경에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        재설정
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogTitle>비밀번호 재설정</DialogTitle>

          {step === "request" && (
            <>
              <DialogDescription>
                {email} 으로 6자리 인증 코드를 보냅니다.
              </DialogDescription>
              <Button onClick={sendCode} disabled={loading}>
                {loading ? "전송 중..." : "인증 코드 받기"}
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              <DialogDescription>
                메일로 받은 6자리 코드를 입력하세요. 코드는 5분 후 만료됩니다.
              </DialogDescription>
              <div className="space-y-2">
                <Label htmlFor="reset-code">인증 코드</Label>
                <Input
                  id="reset-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  maxLength={CODE_LENGTH}
                  placeholder="ABC123"
                  className="text-center text-lg tracking-[0.3em] uppercase"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={sendCode}
                  disabled={loading}
                  className="flex-1"
                >
                  코드 재발송
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={loading || code.trim().length !== CODE_LENGTH}
                  className="flex-1"
                >
                  {loading ? "확인 중..." : "다음"}
                </Button>
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <DialogDescription>
                새 비밀번호를 입력하세요. 변경하면 모든 기기에서 로그아웃됩니다.
              </DialogDescription>
              <div className="space-y-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="8자 이상"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              <Button
                onClick={resetPassword}
                disabled={loading || newPassword.length < MIN_PASSWORD}
              >
                {loading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
