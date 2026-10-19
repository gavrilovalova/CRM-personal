import { UserXIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ContactNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-muted px-6 py-16 text-center">
      <span className="mb-1 flex size-12 items-center justify-center rounded-lg bg-pink">
        <UserXIcon className="size-6" />
      </span>
      <p className="text-lg font-bold">Такого контакта нет</p>
      <p className="text-muted-foreground">Возможно, ссылка устарела или в ней опечатка.</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">К списку контактов</Link>
      </Button>
    </div>
  );
}
