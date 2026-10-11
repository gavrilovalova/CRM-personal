import { UserXIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ContactNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <UserXIcon className="size-8 text-muted-foreground" />
      <p className="font-medium">Такого контакта нет</p>
      <p className="text-sm text-muted-foreground">Возможно, ссылка устарела или в ней опечатка.</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">К списку контактов</Link>
      </Button>
    </div>
  );
}
