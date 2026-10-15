export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: "USER" | "CREATOR" | "ADMIN";
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 서버 /auth/me 중 화면이 쓰는 필드
export interface AuthMe {
  username: string;
  email: string;
}

export interface Device {
  id: string;
  deviceType: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string | null;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}
