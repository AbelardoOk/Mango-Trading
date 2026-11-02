import { cn } from "@/lib/cn";

type Tone = "green" | "orange" | "red" | "neutral" | "ink";

const tones: Record<Tone, string> = {
  green: "bg-soft text-green border-green/20",
  orange: "bg-[#fff0d6] text-[#754600] border-orange/40",
  red: "bg-[#fbece9] text-[#9c2e26] border-red/20",
  neutral: "bg-bg text-muted-strong border-line",
  ink: "bg-ink text-white border-ink",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
