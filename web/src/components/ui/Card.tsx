import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(23,46,39,0.04)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}
