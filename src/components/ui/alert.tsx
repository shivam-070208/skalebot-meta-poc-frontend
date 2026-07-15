import { cn } from "@/lib/utils";

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: "info" | "success" | "error" | "warning";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "info" && "border-blue-200 bg-blue-50 text-blue-800",
        variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        variant === "error" && "border-red-200 bg-red-50 text-red-800",
        variant === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        className
      )}
    >
      {children}
    </div>
  );
}
