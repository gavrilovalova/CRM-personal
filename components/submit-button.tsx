import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  pending,
  disabled,
  children,
  className,
}: {
  pending: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button type="submit" disabled={pending || disabled} className={className}>
      {pending && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
