import { cn, statusColor } from "@/lib/utils";

export function Badge({
  children,
  status,
  className,
}: {
  children: React.ReactNode;
  status?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        status ? statusColor(status) : "bg-zinc-100 text-zinc-700",
        className
      )}
    >
      {children}
    </span>
  );
}
