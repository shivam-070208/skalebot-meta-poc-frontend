export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt?: string;
};

export type AuthSession = {
  user: User;
  token: string;
};

export type InstagramAccount = {
  id: string;
  instagramAccountId: string;
  username: string | null;
  profilePicture: string | null;
};

export type InstagramAccountListItem = InstagramAccount & {
  pageId: string | null;
  isActive: boolean;
  createdAt: string;
};

export type InstagramAccountDetail = InstagramAccountListItem & {
  tokenExpiry: string | null;
};

export type CampaignListItem = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  status: string;
  audienceScope: string;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  recipientCount: number;
  contentCount: number;
};

export type CampaignButton = {
  id?: string;
  label: string;
  actionType: string;
  actionValue: string | null;
  position: number;
};

export type CampaignContent = {
  id?: string;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  linkUrl: string | null;
  position: number;
  buttons: CampaignButton[];
};

export type CampaignRecipient = {
  id: string;
  contactId: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  contact?: {
    id: string;
    instagramUserId: string | null;
    username: string | null;
    windowExpiresAt: string | null;
    hasMessagingWindow: boolean;
  };
};

export type CampaignDetail = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  status: string;
  audienceScope: string;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  contents: CampaignContent[];
  recipients: CampaignRecipient[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type PublicPost = {
  id: string;
  accountId: string;
  caption: string | null;
  mediaUrl: string | null;
  scheduledAt: string | null;
  publishStatus: string;
  publishedAt: string | null;
  createdAt: string;
};

export type AutomationRule = {
  id: string;
  postId: string;
  triggerType: string;
  triggerValue: string;
  actionType: string;
  actionValue: string;
  isActive: boolean;
  createdAt: string;
};

export type CreatePostResult = {
  post: PublicPost;
  automationRule: AutomationRule | null;
};
