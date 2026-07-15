"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCampaign, updateCampaign } from "@/lib/api";
import type { CampaignDetail } from "@/types/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { formatDate } from "@/lib/utils";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getCampaign(id)
      .then((res) => setCampaign(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!campaign) return <p className="text-sm text-zinc-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/campaigns" className="text-sm text-violet-600 hover:underline">
            ← Back to campaigns
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">{campaign.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge status={campaign.status}>{campaign.status}</Badge>
            <span className="text-sm text-zinc-500">
              Audience: {campaign.audienceScope.replace("_", " ")}
            </span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? "Cancel edit" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardHeader title="Edit campaign" />
          <CampaignForm
            initial={{
              name: campaign.name,
              description: campaign.description ?? "",
              publishType: campaign.status,
              scheduledAt: campaign.scheduledAt ?? undefined,
              audienceScope: campaign.audienceScope,
              contents: campaign.contents,
            }}
            onSubmit={async (body) => {
              const res = await updateCampaign(id, body);
              setCampaign(res.data);
              setEditing(false);
            }}
            submitLabel="Update campaign"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <div className="text-sm text-zinc-500">Scheduled</div>
              <div className="mt-1 font-medium">{formatDate(campaign.scheduledAt)}</div>
            </Card>
            <Card>
              <div className="text-sm text-zinc-500">Content blocks</div>
              <div className="mt-1 font-medium">{campaign.contents.length}</div>
            </Card>
            <Card>
              <div className="text-sm text-zinc-500">Recipients</div>
              <div className="mt-1 font-medium">{campaign.recipients.length}</div>
            </Card>
          </div>

          {campaign.description && (
            <Card>
              <CardHeader title="Description" />
              <p className="text-sm text-zinc-600">{campaign.description}</p>
            </Card>
          )}

          <Card>
            <CardHeader title="Content" />
            <div className="space-y-4">
              {campaign.contents.map((content) => (
                <div key={content.id} className="rounded-lg border border-zinc-100 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>{content.contentType}</Badge>
                    <span className="text-xs text-zinc-400">Position {content.position}</span>
                  </div>
                  {content.textContent && (
                    <p className="text-sm text-zinc-700">{content.textContent}</p>
                  )}
                  {content.mediaUrl && (
                    <p className="mt-1 text-xs text-zinc-500 break-all">{content.mediaUrl}</p>
                  )}
                  {content.linkUrl && (
                    <p className="mt-1 text-xs text-violet-600 break-all">{content.linkUrl}</p>
                  )}
                  {content.buttons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {content.buttons.map((btn) => (
                        <span
                          key={btn.id}
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs"
                        >
                          {btn.label} ({btn.actionType})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recipients" />
            {campaign.recipients.length === 0 ? (
              <p className="text-sm text-zinc-500">No recipients yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-500">
                      <th className="pb-2 font-medium">Contact</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Sent at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.recipients.map((r) => (
                      <tr key={r.id} className="border-b border-zinc-50">
                        <td className="py-2">
                          @{r.contact?.username ?? r.contactId.slice(0, 8)}
                        </td>
                        <td className="py-2">
                          <Badge status={r.status}>{r.status}</Badge>
                        </td>
                        <td className="py-2 text-zinc-600">{formatDate(r.sentAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
