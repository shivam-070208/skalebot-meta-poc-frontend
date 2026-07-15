"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCampaigns, deleteCampaign, ApiError } from "@/lib/api";
import type { CampaignListItem } from "@/types/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const res = await listCampaigns({ search: searchTerm, limit: 50 });
      setCampaigns(res.data.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Campaigns</h1>
          <p className="mt-1 text-zinc-500">Create and manage DM campaigns.</p>
        </div>
        <Link href="/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" onClick={() => void load(search)}>
            Search
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-zinc-500">No campaigns found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Recipients</th>
                  <th className="pb-3 font-medium">Scheduled</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-50">
                    <td className="py-3">
                      <Link href={`/campaigns/${c.id}`} className="font-medium text-violet-600 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-3">
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                    <td className="py-3 text-zinc-600">{c.recipientCount}</td>
                    <td className="py-3 text-zinc-600">{formatDate(c.scheduledAt)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link href={`/campaigns/${c.id}`}>
                          <Button size="sm" variant="ghost">View</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => void handleDelete(c.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
