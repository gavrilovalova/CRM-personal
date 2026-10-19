import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Accent colors of the landing
const COLORS = ["bg-pink text-foreground", "bg-lime text-foreground", "bg-brand-soft text-primary"];

export function ContactAvatar({
  id,
  name,
  className,
}: {
  id: number;
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold select-none",
        COLORS[id % COLORS.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
