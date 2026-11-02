import { cn } from "@/lib/cn";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "light",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "light" | "dark" | "soft";
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "p-5",
        tone === "dark" && "border-ink bg-ink text-white",
        tone === "soft" && "border-soft bg-soft",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("text-xs font-semibold", tone === "dark" ? "text-[#c7d7cc]" : "text-muted")}>
          {label}
        </span>
        {icon ? (
          <span className={cn("rounded-lg p-1.5", tone === "dark" ? "bg-white/10 text-orange" : "bg-soft text-green")}>
            {icon}
          </span>
        ) : null}
      </div>
      <div className={cn("money mt-2 text-2xl font-bold tracking-tight", tone === "dark" ? "text-white" : "text-ink")}>
        {value}
      </div>
      {hint ? (
        <div className={cn("mt-1 text-xs", tone === "dark" ? "text-[#c7d7cc]" : "text-muted")}>{hint}</div>
      ) : null}
    </Card>
  );
}
