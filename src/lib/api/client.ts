import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "@/lib/token";
import type { ApiResponse } from "@/types/api";
import type { RefreshTokenResponse } from "@/types/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 로그인 401을 세션 만료로 오인하지 않게 제외
const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 동시 401은 회전 하나를 공유, 중복이면 세션 무효
let refreshPromise: Promise<string> | null = null;

async function rotateTokens(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error("No refresh token");

  // 인터셉터를 다시 타지 않게 전역 axios로
  const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    { refreshToken },
    { withCredentials: true, headers: { "Content-Type": "application/json" } },
  );

  const tokens = response.data.data;
  if (!tokens) throw new Error("Empty refresh response");

  tokenStore.save(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

function redirectToLogin() {
  tokenStore.clear();
  if (!window.location.pathname.includes("/login")) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- axios 인터셉터(컴포넌트 밖)라 router 사용 불가
    window.location.href = "/login";
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthPath = AUTH_PATHS.some((path) => config?.url?.includes(path));

    if (
      error.response?.status !== 401 ||
      typeof window === "undefined" ||
      !config ||
      isAuthPath
    ) {
      return Promise.reject(error);
    }

    if (config._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }
    config._retry = true;

    try {
      refreshPromise ??= rotateTokens().finally(() => {
        refreshPromise = null;
      });
      const accessToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api(config);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);

// 토스트용 서버 오류 문구
export function getApiErrorMessage(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { error?: string; message?: string } | undefined;
    return data?.error ?? data?.message;
  }
  return undefined;
}

export default api;
