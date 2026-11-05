import type { PagedResponse } from "@/types/api";

export interface UserStatistics {
  totalUsers: number;
  totalCreators: number;
  totalAdmins: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

export interface CreatorApplication {
  id: number;
  userId: number;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  reason: string;
  portfolioUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  rejectionReason?: string;
  reviewedBy?: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface CreatorStatistics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  totalActiveCreators: number;
  averageApprovalTime: string;
}

export type CreatorApplicationListResponse = PagedResponse<CreatorApplication>;

export type UserRole = "USER" | "CREATOR" | "ADMIN";

// 서버 ProfileResponse 중 관리자 화면이 쓰는 필드
export interface UserProfile {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  followerCount: number;
  followingCount: number;
  postCount: number;
  /** 크리에이터·관리자만, 일반은 null */
  subscriberCount?: number | null;
}

export interface UserSummary {
  id: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  avatarThumbUrl?: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  /** 크리에이터·관리자만, 일반은 null */
  subscriberCount?: number | null;
}

export type UserListResponse = PagedResponse<UserSummary>;

// 서버 ProfileResponse 중 내 프로필 화면이 쓰는 필드
export interface MyProfile {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
}
