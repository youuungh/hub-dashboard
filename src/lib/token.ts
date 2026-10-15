const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

// 서버 렌더 중엔 storage가 없음
const storage = () =>
  typeof window === "undefined" ? null : window.localStorage;

export const tokenStore = {
  getAccess: () => storage()?.getItem(ACCESS_KEY) ?? null,
  getRefresh: () => storage()?.getItem(REFRESH_KEY) ?? null,
  save(accessToken: string, refreshToken: string) {
    storage()?.setItem(ACCESS_KEY, accessToken);
    storage()?.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    storage()?.removeItem(ACCESS_KEY);
    storage()?.removeItem(REFRESH_KEY);
  },
};

export interface AccessTokenPayload {
  userId?: number;
  email?: string;
  username?: string;
  role?: string;
  sessionId?: string;
  exp?: number;
}

// 서명 검증 없이 표시용으로만 디코드
export function getTokenPayload(): AccessTokenPayload | null {
  const token = tokenStore.getAccess();
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as AccessTokenPayload;
  } catch {
    return null;
  }
}
