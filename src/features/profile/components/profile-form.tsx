"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, type Me } from "@/hooks/use-me";
import { getApiErrorMessage } from "@/lib/api/client";
import { updateMyProfile, uploadMyAvatar } from "@/lib/api/users";
import { queryKeys } from "@/lib/query-keys";
import type { MyProfile } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const profileFormSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const me = useMe();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const avatarUrl = me.data?.avatarUrl || "";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
    },
  });

  // 처음 한 번만 채움, 사진을 바꿔도 입력 유지
  const filled = useRef(false);
  useEffect(() => {
    if (me.data && !filled.current) {
      filled.current = true;
      form.reset({
        displayName: me.data.displayName || "",
        bio: me.data.bio || "",
      });
    }
  }, [me.data, form]);

  useEffect(() => {
    if (me.isError) toast.error("프로필 데이터를 불러오는데 실패했습니다");
  }, [me.isError]);

  // 사이드바도 같은 캐시라 함께 갱신
  const applyProfile = (profile: MyProfile) =>
    queryClient.setQueryData<Me>(queryKeys.me, (prev) =>
      prev
        ? {
            ...prev,
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
          }
        : prev,
    );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("유효한 이미지 파일을 업로드해주세요 (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("파일 크기는 5MB 이하여야 합니다");
      return;
    }

    try {
      setUploadingAvatar(true);
      applyProfile(await uploadMyAvatar(file));
      toast.success("프로필 사진이 성공적으로 업데이트되었습니다");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) || "프로필 사진 업로드에 실패했습니다",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setSubmitting(true);
      const profile = await updateMyProfile(data);
      applyProfile(profile);
      form.reset({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
      });
      toast.success("프로필이 성공적으로 업데이트되었습니다");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) || "프로필 업데이트에 실패했습니다",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (me.isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-3 w-56" />
              </div>
            ))}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 정보</CardTitle>
        <CardDescription>
          프로필 정보를 수정하고 다른 사용자에게 보이는 모습을 관리합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            {avatarUrl ? (
              <button
                type="button"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => setImageViewerOpen(true)}
              >
                <UserAvatar src={avatarUrl} className="h-24 w-24" />
              </button>
            ) : (
              <UserAvatar src={avatarUrl} className="h-24 w-24" />
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4">
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingAvatar}
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingAvatar ? "업로드 중..." : "사진 변경"}
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                JPG · PNG · WebP · 최대 5MB
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">아이디</label>
              <Input
                value={me.data?.username ?? ""}
                disabled
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                변경할 수 없습니다
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">이메일</label>
              <Input value={me.data?.email ?? ""} disabled className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                변경하려면 관리자에게 문의하세요
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>표시 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="표시 이름을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="자기소개를 입력하세요"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>최대 160자</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting}>
                {submitting ? "저장 중..." : "저장"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>

      {imageViewerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setImageViewerOpen(false)}
        >
          {avatarUrl ? (
            <>
              <div
                className="fixed inset-0 -z-10"
                style={{
                  backgroundImage: `url(${avatarUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(60px)",
                  transform: "scale(1.2)",
                }}
              />
              <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl -z-10" />
            </>
          ) : (
            <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 -z-10" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- 아바타 미리보기, next/image 최적화 대상 아님 */}
          <img
            src={avatarUrl}
            alt="프로필 사진"
            className="relative z-50 w-96 h-96 aspect-square object-cover rounded-full shadow-2xl pointer-events-auto"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Card>
  );
}
