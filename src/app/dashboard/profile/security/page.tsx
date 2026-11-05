"use client";

import { getApiErrorMessage } from "@/lib/api/client";
import { getDevices, removeDevice } from "@/lib/api/auth";
import { useMe } from "@/hooks/use-me";
import { queryKeys } from "@/lib/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PasswordResetCard } from "@/features/profile/components/password-reset-card";
import type { Device } from "@/types/auth";
import { parseServerDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
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
      return <Smartphone className="size-4" />;
    case "tablet":
      return <Tablet className="size-4" />;
    default:
      return <Monitor className="size-4" />;
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
    <div className="space-y-4">
      <PasswordResetCard email={email} />

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b py-3">
          <CardTitle>활성 기기</CardTitle>
          <Badge variant="outline" className="font-normal">
            {devices.length}대
          </Badge>
        </CardHeader>
        {devices.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            활성 기기가 없습니다
          </div>
        ) : (
          <div className="divide-y">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <span className="bg-muted text-muted-foreground flex size-[30px] shrink-0 items-center justify-center rounded-md">
                  {getDeviceIcon(device.deviceType)}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {device.browser} · {device.os}
                    </p>
                    {device.isCurrent && (
                      <Badge variant="outline" className="font-normal">
                        현재 기기
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {formatIpAddress(device.ipAddress, device.location)} ·{" "}
                    {formatDateTime(device.lastActive)}
                  </p>
                </div>
                {!device.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeviceToRemove(device.id)}
                  >
                    제거
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
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
