"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import type {
  InstagramAccount,
  InstagramAccountListItem,
  User,
} from "@/types/api";
import { clearAuthStorage, getToken, setToken } from "@/lib/storage";

const toPrimaryAccount = (
  items: InstagramAccountListItem[]
): InstagramAccount | null => {
  const active = items.find((a) => a.isActive) ?? items[0];
  if (!active) return null;
  return {
    id: active.id,
    instagramAccountId: active.instagramAccountId,
    username: active.username,
    profilePicture: active.profilePicture,
  };
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  instagramAccount: InstagramAccount | null;
  instagramAccounts: InstagramAccountListItem[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshInstagramAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [instagramAccount, setInstagramAccount] =
    useState<InstagramAccount | null>(null);
  const [instagramAccounts, setInstagramAccounts] = useState<
    InstagramAccountListItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  const refreshInstagramAccount = useCallback(async () => {
    try {
      const res = await api.listAccounts({ is_active: true, limit: 50 });
      setInstagramAccounts(res.data.items);
      setInstagramAccount(toPrimaryAccount(res.data.items));
    } catch {
      setInstagramAccounts([]);
      setInstagramAccount(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getToken();
    if (!storedToken) {
      setUser(null);
      setTokenState(null);
      return;
    }
    const { user: me } = await api.getMe(storedToken);
    setUser(me);
    setTokenState(storedToken);
    await refreshInstagramAccount();
  }, [refreshInstagramAccount]);

  useEffect(() => {
    const init = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { user: me } = await api.getMe(storedToken);
        setUser(me);
        setTokenState(storedToken);
        await refreshInstagramAccount();
      } catch {
        clearAuthStorage();
        setUser(null);
        setTokenState(null);
        setInstagramAccount(null);
        setInstagramAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [refreshInstagramAccount]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await api.login(email, password);
      setToken(session.token);
      setTokenState(session.token);
      setUser(session.user);
      await refreshInstagramAccount();
      router.push("/dashboard");
    },
    [router, refreshInstagramAccount]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const session = await api.register(email, password, name);
      setToken(session.token);
      setTokenState(session.token);
      setUser(session.user);
      router.push("/connect-instagram");
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    clearAuthStorage();
    setUser(null);
    setTokenState(null);
    setInstagramAccount(null);
    setInstagramAccounts([]);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      token,
      instagramAccount,
      instagramAccounts,
      loading,
      login,
      register,
      logout,
      refreshUser,
      refreshInstagramAccount,
    }),
    [
      user,
      token,
      instagramAccount,
      instagramAccounts,
      loading,
      login,
      register,
      logout,
      refreshUser,
      refreshInstagramAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
