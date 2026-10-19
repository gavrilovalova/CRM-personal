import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-24 text-center">
      <p className="mb-3 inline-block -rotate-2 rounded-xl bg-primary px-4 py-1 text-6xl leading-display font-extrabold tracking-display text-primary-foreground">
        404
      </p>
      <p className="text-lg font-bold">Такой страницы нет</p>
      <Button asChild variant="secondary" className="mt-2">
        <Link href="/">К списку контактов</Link>
      </Button>
    </main>
  );
}
