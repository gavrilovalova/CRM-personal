"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ShowMoreButton({ href }: { href: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full sm:w-auto"
      // Not disabled while loading: a disabled button would lose keyboard focus
      aria-busy={isPending}
      onClick={() => {
        if (isPending) return;
        startTransition(() => router.replace(href, { scroll: false }));
      }}
    >
      {isPending && <Loader2Icon className="animate-spin" />}
      Показать ещё
    </Button>
  );
}
