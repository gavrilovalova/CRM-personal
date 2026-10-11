import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="text-5xl font-semibold text-muted-foreground">404</p>
      <p className="font-medium">Такой страницы нет</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">К списку контактов</Link>
      </Button>
    </main>
  );
}
