"use client";

import { tokenStore } from "@/lib/token";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { HaloLogo } from "@/components/halo-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { login } from "@/lib/api/auth";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 주소를 입력하세요" }),
  password: z.string().min(1, { message: "비밀번호를 입력하세요" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      form.setValue("email", savedEmail);
      setRememberEmail(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const response = await login(data);

      if (response.user.role !== "ADMIN" && response.user.role !== "CREATOR") {
        toast.error("관리자 또는 크리에이터 권한이 필요합니다.");
        return;
      }

      if (rememberEmail) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      tokenStore.save(response.accessToken, response.refreshToken);
      toast.success("로그인 성공!");
      router.push("/dashboard/overview");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.error || "로그인에 실패했습니다.";
        toast.error(message);
      } else {
        toast.error("로그인에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-7 p-6">
      <HaloLogo className="size-28" />
      <Card className="bg-card/70 w-full max-w-sm backdrop-blur-2xl backdrop-saturate-180">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl tracking-tight">로그인</CardTitle>
          <CardDescription>관리자 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberEmail}
                  onCheckedChange={(checked) =>
                    setRememberEmail(checked === true)
                  }
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  이메일 기억하기
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Icons.spinner className="mr-0.5 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.login2 className="mr-0.5 h-4 w-4" />
                )}
                로그인
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
