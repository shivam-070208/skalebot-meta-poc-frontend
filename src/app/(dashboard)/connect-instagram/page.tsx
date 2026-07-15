"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

function ConnectInstagramContent() {
  const { token, instagramAccount, instagramAccounts, refreshInstagramAccount } =
    useAuth();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(searchParams.get("error") ?? "");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") !== "1") return;

    setRefreshing(true);
    void refreshInstagramAccount()
      .then(() => setMessage("Instagram account connected successfully!"))
      .catch(() => setError("Connected but failed to load account details"))
      .finally(() => setRefreshing(false));
  }, [searchParams, refreshInstagramAccount]);

  const handleConnect = () => {
    if (!token) {
      setError("You must be logged in to connect Instagram");
      return;
    }

    const redirectUrl =
      process.env.NEXT_PUBLIC_INSTAGRAM_OAUTH_REDIRECT_URL ??
      `${window.location.origin}/connect-instagram?success=1`;

    const params = new URLSearchParams({
      token,
      redirect_url: redirectUrl,
    });

    window.location.href = `/api/auth/instagram?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Connect Instagram</h1>
        <p className="mt-1 text-zinc-500">
          Link your Instagram business account to publish posts and run campaigns.
        </p>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardHeader
          title="Primary account"
          description="Used for posts and campaigns. Fetched from your connected accounts."
        />
        {refreshing ? (
          <p className="text-sm text-zinc-500">Loading account...</p>
        ) : instagramAccount ? (
          <div className="flex items-center gap-4">
            {instagramAccount.profilePicture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={instagramAccount.profilePicture}
                alt=""
                className="h-16 w-16 rounded-full border border-zinc-200"
              />
            )}
            <div>
              <div className="text-lg font-semibold text-zinc-900">
                @{instagramAccount.username ?? "connected"}
              </div>
              <div className="text-sm text-zinc-500">
                Account ID: {instagramAccount.id}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              No Instagram account connected yet. Click below to authorize via Meta.
            </p>
            <Button onClick={handleConnect}>Connect Instagram</Button>
          </div>
        )}

        <div className="mt-6 border-t border-zinc-100 pt-4">
          <Button variant="secondary" onClick={handleConnect}>
            {instagramAccount ? "Reconnect / switch account" : "Connect Instagram"}
          </Button>
        </div>
      </Card>

      {instagramAccounts.length > 0 && (
        <Card>
          <CardHeader
            title="Connected accounts"
            description={`${instagramAccounts.length} account(s) linked to your profile`}
          />
          <div className="divide-y divide-zinc-100">
            {instagramAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {account.profilePicture && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.profilePicture}
                      alt=""
                      className="h-10 w-10 rounded-full border border-zinc-200"
                    />
                  )}
                  <div>
                    <div className="font-medium text-zinc-900">
                      @{account.username ?? account.instagramAccountId}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Connected {formatDate(account.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {instagramAccount?.id === account.id && (
                    <Badge status="active">Primary</Badge>
                  )}
                  <Badge status={account.isActive ? "completed" : "failed"}>
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ConnectInstagramPage() {
  return (
    <Suspense>
      <ConnectInstagramContent />
    </Suspense>
  );
}
