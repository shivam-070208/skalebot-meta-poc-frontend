import type {
  ApiSuccess,
  AuthSession,
  CampaignDetail,
  CampaignListItem,
  CreatePostResult,
  AutomationRule,
  PaginationMeta,
  User,
  InstagramAccountDetail,
  InstagramAccountListItem,
} from "@/types/api";
import { getToken } from "@/lib/storage";

const API_BASE = "/api/backend/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  skipAuth?: boolean;
};

async function request<T>(
  path: string,
  { method = "GET", body, token, skipAuth = false }: RequestOptions = {}
): Promise<T> {
  const authToken = skipAuth ? null : (token ?? getToken());
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : "Request failed";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

// Auth
export const register = (email: string, password: string, name?: string) =>
  request<AuthSession>("/auth/register", {
    method: "POST",
    body: { email, password, name },
    skipAuth: true,
  });

export const login = (email: string, password: string) =>
  request<AuthSession>("/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });

export const logout = () =>
  request<{ message: string }>("/auth/logout", { method: "POST" });

export const getMe = (token?: string) =>
  request<{ user: User }>("/auth/me", { token });

export const forgotPassword = (email: string) =>
  request<{ resetToken: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });

export const resetPassword = (resetToken: string, newPassword: string) =>
  request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { resetToken, newPassword },
    skipAuth: true,
  });

// Campaigns
export const listCampaigns = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return request<ApiSuccess<{ items: CampaignListItem[]; pagination: PaginationMeta }>>(
    `/campaigns${query ? `?${query}` : ""}`
  );
};

export const getCampaign = (id: string) =>
  request<ApiSuccess<CampaignDetail>>(`/campaigns/${id}`);

export const createCampaign = (body: Record<string, unknown>) =>
  request<ApiSuccess<CampaignDetail>>("/campaigns", {
    method: "POST",
    body,
  });

export const updateCampaign = (id: string, body: Record<string, unknown>) =>
  request<ApiSuccess<CampaignDetail>>(`/campaigns/${id}`, {
    method: "PATCH",
    body,
  });

export const deleteCampaign = (id: string) =>
  request<ApiSuccess<{ id: string }>>(`/campaigns/${id}`, {
    method: "DELETE",
  });

export const getCampaignRecipients = (id: string) =>
  request<
    ApiSuccess<{
      campaign: CampaignDetail;
      recipients: CampaignDetail["recipients"];
    }>
  >(`/campaigns/${id}/recipients`);

// Posts
export const createPost = (body: Record<string, unknown>) =>
  request<CreatePostResult>("/posts", { method: "POST", body });

export const getPostAutomationRule = (postId: string) =>
  request<{ automationRule: AutomationRule }>(`/posts/${postId}/automation-rule`);

// Accounts
export const listAccounts = (params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.is_active !== undefined) {
    qs.set("is_active", String(params.is_active));
  }
  const query = qs.toString();
  return request<
    ApiSuccess<{ items: InstagramAccountListItem[]; pagination: PaginationMeta }>
  >(`/accounts${query ? `?${query}` : ""}`);
};

export const getAccount = (id: string) =>
  request<ApiSuccess<InstagramAccountDetail>>(`/accounts/${id}`);
