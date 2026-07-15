export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function statusColor(status: string) {
  switch (status) {
    case "published":
    case "completed":
    case "sent":
      return "bg-emerald-100 text-emerald-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "scheduled":
    case "queued":
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "active":
    case "publishing":
    case "instant":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}
