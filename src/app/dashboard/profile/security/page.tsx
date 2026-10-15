"use client";

import { getApiErrorMessage } from "@/lib/api/client";
import { getDevices, removeDevice } from "@/lib/api/auth";
import { useMe } from "@/hooks/use-me";
import { queryKeys } from "@/lib/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PasswordResetDialog } from "@/features/profile/components/password-reset-dialog";
import type { Device } from "@/types/auth";
import { parseServerDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-5 w-5" />;
    case "tablet":
      return <Tablet className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
};

const formatDateTime = (dateString: string) => {
  const date = parseServerDate(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "어제";
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const formatIpAddress = (ip: string, location: string | null) => {
  if (ip === "0:0:0:0:0:0:0:1" || ip === "::1") {
    return "로컬 네트워크";
  }

  if (
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return "로컬 네트워크";
  }

  if (location) {
    return `${ip} (${location})`;
  }

  return ip;
};

export default function SecurityPage() {
  const me = useMe();
  // 실패해도 알리지 않고 빈 목록
  const devicesQuery = useQuery({
    queryKey: queryKeys.devices,
    queryFn: getDevices,
  });
  const queryClient = useQueryClient();
  const email = me.data?.email ?? "";
  const devices: Device[] = devicesQuery.data ?? [];
  const loading = me.isPending || devicesQuery.isPending;
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemoveDevice = async (sessionId: string) => {
    try {
      setRemoving(true);
      await removeDevice(sessionId);
      toast.success("기기가 성공적으로 제거되었습니다");
      await queryClient.invalidateQueries({ queryKey: queryKeys.devices });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "기기 제거에 실패했습니다");
    } finally {
      setRemoving(false);
      setDeviceToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <Skeleton className="size-5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">비밀번호</CardTitle>
          <CardDescription>
            메일로 받은 인증 코드로 비밀번호를 변경합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">이메일</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <PasswordResetDialog email={email} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">활성 기기</CardTitle>
          <CardDescription>현재 로그인된 기기를 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              활성 기기가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{device.os}</p>
                        {device.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            현재 기기
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {device.browser}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatIpAddress(device.ipAddress, device.location)}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(device.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                  {!device.isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeviceToRemove(device.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deviceToRemove !== null}
        onOpenChange={() => setDeviceToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이 기기를 제거할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              해당 기기가 로그아웃되며, 다시 쓰려면 그 기기에서 새로 로그인해야
              합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deviceToRemove && handleRemoveDevice(deviceToRemove)
              }
              disabled={removing}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removing ? "제거 중..." : "제거"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
