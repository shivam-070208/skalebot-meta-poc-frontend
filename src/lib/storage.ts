const TOKEN_KEY = "skalebot_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const clearAuthStorage = (): void => {
  clearToken();
  // cleanup legacy account cache from earlier versions
  localStorage.removeItem("skalebot_instagram_account");
};
