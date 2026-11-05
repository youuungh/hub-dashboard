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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// 왼쪽 이름표, 오른쪽 입력칸
const ROW =
  "grid gap-1.5 border-t px-4 py-3.5 first:border-t-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start sm:gap-4";
const ROW_LABEL = "text-[13px] font-medium sm:pt-1.5";

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
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-3">
          <CardTitle>프로필 사진</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3.5 py-3.5">
          {avatarUrl ? (
            <button
              type="button"
              className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
              onClick={() => setImageViewerOpen(true)}
            >
              <UserAvatar src={avatarUrl} className="size-14" />
            </button>
          ) : (
            <UserAvatar src={avatarUrl} className="size-14" />
          )}
          <div className="flex min-w-40 flex-1 flex-col gap-0.5">
            <span className="font-medium">
              {me.data?.displayName || me.data?.username}
            </span>
            <span className="text-muted-foreground text-xs">
              JPEG · PNG · WebP, 5MB 이하
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadingAvatar}
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            <Upload />
            {uploadingAvatar ? "업로드 중..." : "사진 바꾸기"}
          </Button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
          />
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3">
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className={ROW}>
                    <FormLabel className={ROW_LABEL}>표시 이름</FormLabel>
                    <div className="space-y-1.5">
                      <FormControl>
                        <Input
                          placeholder="표시 이름을 입력하세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className={ROW}>
                <label htmlFor="profile-username" className={ROW_LABEL}>
                  아이디
                </label>
                <Input
                  id="profile-username"
                  value={me.data?.username ? `@${me.data.username}` : ""}
                  readOnly
                  className="text-muted-foreground border-dashed bg-transparent dark:bg-transparent"
                />
              </div>
              <div className={ROW}>
                <label htmlFor="profile-email" className={ROW_LABEL}>
                  이메일
                </label>
                <Input
                  id="profile-email"
                  value={me.data?.email ?? ""}
                  readOnly
                  className="text-muted-foreground border-dashed bg-transparent dark:bg-transparent"
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className={ROW}>
                    <FormLabel className={ROW_LABEL}>소개</FormLabel>
                    <div className="space-y-1.5">
                      <FormControl>
                        <Textarea
                          placeholder="자기소개를 입력하세요"
                          className="min-h-[76px] resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-right tabular-nums">
                        {(field.value ?? "").length} / 160
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <div className="bg-band flex justify-end gap-2 rounded-b-lg border-t px-4 py-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting || !form.formState.isDirty}
                onClick={() => form.reset()}
              >
                되돌리기
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </Card>
        </form>
      </Form>

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
            <div className="fixed inset-0 bg-black/10 backdrop-blur-md animate-in fade-in-0 -z-10" />
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
    </div>
  );
}
