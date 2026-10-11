"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { Badge } from "@/components/ui/badge";
import type { ContactListItem } from "@/db/queries";
import { cn } from "@/lib/utils";

// Rows are rendered from plain data in a client component: a server-rendered tree
// of 1000 rows is many times slower to stream in development mode.
export function ContactRows({
  items,
  highlightedId,
}: {
  items: ContactListItem[];
  highlightedId: number | null;
}) {
  // After adding a contact, scroll to the new row and move focus to it
  useEffect(() => {
    if (!highlightedId) return;
    const row = document.getElementById(`contact-${highlightedId}`);
    row?.scrollIntoView({ block: "center" });
    row?.querySelector("a")?.focus({ preventScroll: true });
  }, [highlightedId]);

  return (
    <div className="rounded-xl border bg-card shadow-xs">
      {groupByLetter(items).map((group, groupIndex) => (
        <div key={group.letter + groupIndex}>
          <div
            className={cn(
              "sticky top-16 z-10 border-b bg-muted/90 px-4 py-1 text-xs font-semibold text-muted-foreground backdrop-blur",
              groupIndex === 0 ? "rounded-t-xl" : "border-t",
            )}
          >
            {group.letter}
          </div>
          <ul className="divide-y">
            {group.items.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                highlighted={contact.id === highlightedId}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function groupByLetter(items: ContactListItem[]) {
  const groups: { letter: string; items: ContactListItem[] }[] = [];
  for (const item of items) {
    const first = item.name.trim().charAt(0).toUpperCase();
    // "Ё" names sort together with "Е", so keep them in one group
    const letter = first === "Ё" ? "Е" : /\p{L}/u.test(first) ? first : "#";
    const last = groups.at(-1);
    if (last?.letter === letter) {
      last.items.push(item);
    } else {
      groups.push({ letter, items: [item] });
    }
  }
  return groups;
}

function ContactRow({
  contact,
  highlighted,
}: {
  contact: ContactListItem;
  highlighted: boolean;
}) {
  return (
    <li id={`contact-${contact.id}`}>
      <Link
        href={`/contacts/${contact.id}`}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
          highlighted && "bg-amber-50 hover:bg-amber-100/70",
        )}
      >
        <ContactAvatar id={contact.id} name={contact.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{contact.name}</span>
            {highlighted && (
              <Badge className="bg-amber-500 text-white">Только что добавлен</Badge>
            )}
          </div>
          {contact.about && (
            <p className="truncate text-sm text-muted-foreground">{contact.about}</p>
          )}
        </div>
        <p className="hidden w-64 truncate text-sm text-muted-foreground md:block">
          {contact.howWeMet}
        </p>
        <p className="hidden w-40 text-sm whitespace-nowrap text-muted-foreground tabular-nums lg:block">
          {contact.phone}
        </p>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
