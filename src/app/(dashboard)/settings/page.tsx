"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAccount } from "@/lib/api";
import type { InstagramAccountDetail } from "@/types/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { user, instagramAccount, instagramAccounts, logout } = useAuth();
  const [accountDetail, setAccountDetail] = useState<InstagramAccountDetail | null>(
    null
  );

  useEffect(() => {
    if (!instagramAccount?.id) {
      setAccountDetail(null);
      return;
    }
    void getAccount(instagramAccount.id)
      .then((res) => setAccountDetail(res.data))
      .catch(() => setAccountDetail(null));
  }, [instagramAccount?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="mt-1 text-zinc-500">Manage your account and connections.</p>
      </div>

      <Card>
        <CardHeader title="Profile" />
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between border-b border-zinc-100 pb-2">
            <dt className="text-zinc-500">Name</dt>
            <dd className="font-medium">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between border-b border-zinc-100 pb-2">
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Role</dt>
            <dd className="font-medium capitalize">{user?.role}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Instagram connection"
          action={
            <Link href="/connect-instagram">
              <Button variant="secondary" size="sm">
                Manage
              </Button>
            </Link>
          }
        />
        {instagramAccount?.id ? (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-500">Username: </span>
              <span className="font-medium">@{instagramAccount.username}</span>
            </div>
            <div>
              <span className="text-zinc-500">Internal account ID: </span>
              <span className="font-mono text-xs">{instagramAccount.id}</span>
            </div>
            <div>
              <span className="text-zinc-500">Instagram user ID: </span>
              <span className="font-mono text-xs">
                {instagramAccount.instagramAccountId}
              </span>
            </div>
            {accountDetail?.tokenExpiry && (
              <div>
                <span className="text-zinc-500">Token expires: </span>
                <span className="font-medium">
                  {formatDate(accountDetail.tokenExpiry)}
                </span>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Total connected: </span>
              <span className="font-medium">{instagramAccounts.length}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            No Instagram account connected.{" "}
            <Link href="/connect-instagram" className="text-violet-600 hover:underline">
              Connect now
            </Link>
          </p>
        )}
      </Card>

      <Card>
        <CardHeader title="Session" />
        <Button variant="danger" onClick={() => void logout()}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
