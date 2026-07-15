"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createPost, ApiError } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { CreatePostResult } from "@/types/api";

export default function NewPostPage() {
  const { instagramAccount } = useAuth();
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [publishType, setPublishType] = useState("instant");
  const [scheduledAt, setScheduledAt] = useState("");
  const [addAutomation, setAddAutomation] = useState(false);
  const [triggerType, setTriggerType] = useState("comment");
  const [triggerValue, setTriggerValue] = useState("");
  const [actionType, setActionType] = useState("send_text");
  const [actionValue, setActionValue] = useState("");
  const [result, setResult] = useState<CreatePostResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!instagramAccount?.id) {
    return (
      <div className="space-y-4">
        <Alert variant="warning">
          Connect your Instagram account before publishing posts.
        </Alert>
        <Link href="/connect-instagram">
          <Button>Connect Instagram</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        account_id: instagramAccount.id,
        media_url: mediaUrl,
        caption: caption || undefined,
        publish_type: publishType,
      };

      if (publishType === "scheduled" && scheduledAt) {
        body.scheduled_at = new Date(scheduledAt).toISOString();
      }

      if (addAutomation) {
        body.automation_rule = {
          trigger_type: triggerType,
          trigger_value: triggerValue,
          action_type: actionType,
          action_value: actionValue,
        };
      }

      const res = await createPost(body);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Create post</h1>
        <p className="mt-1 text-zinc-500">
          Publish to @{instagramAccount.username} with optional automation rules.
        </p>
      </div>

      {result ? (
        <Card>
          <CardHeader title="Post queued" />
          <Alert variant="success">
            Post created and {result.post.publishStatus === "scheduled" ? "scheduled" : "queued"} for publishing.
          </Alert>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Post ID</dt>
              <dd className="font-mono text-xs">{result.post.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Status</dt>
              <dd><Badge status={result.post.publishStatus}>{result.post.publishStatus}</Badge></dd>
            </div>
          </dl>
          {result.automationRule && (
            <div className="mt-4 rounded-lg border border-zinc-100 p-4 text-sm">
              <div className="font-medium">Automation rule attached</div>
              <p className="mt-1 text-zinc-600">
                When <strong>{result.automationRule.triggerType}</strong> matches &quot;
                {result.automationRule.triggerValue}&quot; → {result.automationRule.actionType}
              </p>
            </div>
          )}
          <Button className="mt-4" onClick={() => setResult(null)}>
            Create another
          </Button>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Post details"
            description="Provide a publicly accessible media URL (image or video)."
          />
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label="Media URL"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
            <Textarea
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Publish type"
                value={publishType}
                onChange={(e) => setPublishType(e.target.value)}
              >
                <option value="instant">Publish instantly</option>
                <option value="scheduled">Schedule</option>
              </Select>
              {publishType === "scheduled" && (
                <Input
                  label="Scheduled at"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={addAutomation}
                  onChange={(e) => setAddAutomation(e.target.checked)}
                />
                Add automation rule
              </label>

              {addAutomation && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Select
                    label="Trigger type"
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                  >
                    <option value="message">Message</option>
                    <option value="comment">Comment</option>
                    <option value="keyword">Keyword</option>
                  </Select>
                  <Input
                    label="Trigger value"
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                    placeholder="e.g. price, DM me"
                    required
                  />
                  <Select
                    label="Action type"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option value="send_text">Send text DM</option>
                    <option value="send_campaign">Send campaign</option>
                  </Select>
                  <Input
                    label="Action value"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    placeholder={actionType === "send_campaign" ? "Campaign UUID" : "Reply text"}
                    required
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create post"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
