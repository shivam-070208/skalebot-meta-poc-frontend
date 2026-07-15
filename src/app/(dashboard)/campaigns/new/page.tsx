"use client";

import { useRouter } from "next/navigation";
import { createCampaign } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCampaignPage() {
  const router = useRouter();
  const { instagramAccount } = useAuth();

  if (!instagramAccount?.id) {
    return (
      <div className="space-y-4">
        <Alert variant="warning">
          Connect your Instagram account before creating campaigns.
        </Alert>
        <Link href="/connect-instagram">
          <Button>Connect Instagram</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">New campaign</h1>
        <p className="mt-1 text-zinc-500">Build a multi-content DM campaign.</p>
      </div>
      <Card>
        <CardHeader title="Campaign details" />
        <CampaignForm
          onSubmit={async (body) => {
            const res = await createCampaign(body);
            router.push(`/campaigns/${res.data.id}`);
          }}
          submitLabel="Create campaign"
        />
      </Card>
    </div>
  );
}
