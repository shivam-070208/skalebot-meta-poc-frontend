"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { listCampaigns } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampaignListItem } from "@/types/api";

export default function DashboardPage() {
  const { user, instagramAccount } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);

  useEffect(() => {
    void listCampaigns({ limit: 5 }).then((res) => setCampaigns(res.data.items));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Hey{user?.name ? `, ${user.name}` : ""} 👋
        </h1>
        <p className="mt-1 text-zinc-500">
          Manage Instagram posts, campaigns, and automations from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm text-zinc-500">Instagram account</div>
          <div className="mt-2 text-lg font-semibold text-zinc-900">
            {instagramAccount?.username
              ? `@${instagramAccount.username}`
              : "Not connected"}
          </div>
          {!instagramAccount && (
            <Link href="/connect-instagram" className="mt-4 inline-block">
              <Button size="sm">Connect now</Button>
            </Link>
          )}
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Recent campaigns</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900">{campaigns.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Quick actions</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/campaigns/new">
              <Button size="sm" variant="secondary">New campaign</Button>
            </Link>
            <Link href="/posts/new">
              <Button size="sm" variant="secondary">New post</Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent campaigns"
          action={
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          }
        />
        {campaigns.length === 0 ? (
          <p className="text-sm text-zinc-500">No campaigns yet. Create your first one!</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="flex items-center justify-between py-3 hover:bg-zinc-50"
              >
                <div>
                  <div className="font-medium text-zinc-900">{c.name}</div>
                  <div className="text-xs text-zinc-500">
                    {c.recipientCount} recipients · {c.contentCount} content blocks
                  </div>
                </div>
                <Badge status={c.status}>{c.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
