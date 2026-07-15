"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import type { CampaignContent } from "@/types/api";

type CampaignFormProps = {
  initial?: {
    name?: string;
    description?: string;
    publishType?: string;
    scheduledAt?: string;
    audienceScope?: string;
    contents?: CampaignContent[];
  };
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
};

const emptyContent = (): CampaignContent => ({
  contentType: "text",
  textContent: "",
  mediaUrl: null,
  linkUrl: null,
  position: 0,
  buttons: [],
});

export function CampaignForm({
  initial,
  onSubmit,
  submitLabel = "Save campaign",
}: CampaignFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [publishType, setPublishType] = useState(initial?.publishType ?? "draft");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : ""
  );
  const [audienceScope, setAudienceScope] = useState(
    initial?.audienceScope ?? "all_subscribers"
  );
  const [contents, setContents] = useState<CampaignContent[]>(
    initial?.contents?.length ? initial.contents : [emptyContent()]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateContent = (index: number, patch: Partial<CampaignContent>) => {
    setContents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  };

  const addContent = () => {
    setContents((prev) => [...prev, { ...emptyContent(), position: prev.length }]);
  };

  const removeContent = (index: number) => {
    setContents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name,
        description: description || null,
        publish_type: publishType,
        contents: contents.map((c, i) => ({
          content_type: c.contentType,
          text_content: c.textContent || null,
          media_url: c.mediaUrl || null,
          link_url: c.linkUrl || null,
          position: i,
          buttons: c.buttons.map((b, bi) => ({
            label: b.label,
            action_type: b.actionType,
            action_value: b.actionValue,
            position: bi,
          })),
        })),
      };

      if (publishType === "scheduled" && scheduledAt) {
        body.scheduled_at = new Date(scheduledAt).toISOString();
      }

      if (audienceScope === "all_subscribers") {
        body.recipient_ids = ["*"];
      }

      await onSubmit(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Campaign name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select label="Publish type" value={publishType} onChange={(e) => setPublishType(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="instant">Send instantly</option>
          <option value="scheduled">Schedule</option>
        </Select>
      </div>

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      {publishType === "scheduled" && (
        <Input
          label="Scheduled at"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      )}

      <Select
        label="Audience"
        value={audienceScope}
        onChange={(e) => setAudienceScope(e.target.value)}
      >
        <option value="all_subscribers">All contacts (subscribers)</option>
        <option value="specific">Specific (draft — no recipients)</option>
      </Select>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-900">Content blocks</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addContent}>
            Add block
          </Button>
        </div>

        {contents.map((content, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Block {index + 1}</span>
              {contents.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeContent(index)}>
                  Remove
                </Button>
              )}
            </div>
            <Select
              label="Content type"
              value={content.contentType}
              onChange={(e) => updateContent(index, { contentType: e.target.value })}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="template">Template</option>
            </Select>
            <Textarea
              label="Text content"
              value={content.textContent ?? ""}
              onChange={(e) => updateContent(index, { textContent: e.target.value })}
              rows={3}
            />
            {(content.contentType === "image" || content.contentType === "video") && (
              <Input
                label="Media URL"
                value={content.mediaUrl ?? ""}
                onChange={(e) => updateContent(index, { mediaUrl: e.target.value })}
                placeholder="https://..."
              />
            )}
            {content.contentType === "link" && (
              <Input
                label="Link URL"
                value={content.linkUrl ?? ""}
                onChange={(e) => updateContent(index, { linkUrl: e.target.value })}
                placeholder="https://..."
              />
            )}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
