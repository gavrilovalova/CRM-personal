import { HeartHandshakeIcon } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countOverdueContacts } from "@/db/queries";
import { formatCount } from "@/lib/format";

const CONTACT_FORMS = ["контакт", "контакта", "контактов"] as const;

/** Header link to the keep-in-touch page with the number of overdue contacts. */
export async function KeepInTouchLink() {
  // The count depends on the current time: compute on every request
  await connection();
  return <KeepInTouchLinkView count={await countOverdueContacts()} />;
}

/** Without a count: shown while the count is loading. */
export function KeepInTouchLinkView({ count = 0 }: { count?: number }) {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="max-sm:h-10 max-sm:px-3 max-sm:text-sm"
    >
      <Link
        href="/keep-in-touch"
        aria-label={count > 0 ? `Пора связаться: ${formatCount(count, CONTACT_FORMS)}` : undefined}
      >
        <HeartHandshakeIcon />
        {/* Phones show only the icon and the count, so the header stays in one row */}
        <span className="max-sm:sr-only">Пора связаться</span>
        {count > 0 && <Badge className="tabular-nums">{count.toLocaleString("ru-RU")}</Badge>}
      </Link>
    </Button>
  );
}
