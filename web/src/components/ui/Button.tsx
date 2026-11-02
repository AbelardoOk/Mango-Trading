import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "orange";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-green text-white hover:bg-[#123f30] shadow-sm",
  secondary: "bg-soft text-green hover:bg-[#dbe9df]",
  outline: "bg-white border border-border text-ink hover:bg-bg",
  ghost: "bg-transparent text-ink hover:bg-soft",
  danger: "bg-red text-white hover:bg-[#942a24]",
  orange: "bg-orange text-ink hover:bg-[#f2a233] shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
