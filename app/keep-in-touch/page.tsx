import { ArrowLeftIcon, ChevronRightIcon, HeartHandshakeIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listOverdueContacts, type OverdueContact } from "@/db/queries";
import { formatCount } from "@/lib/format";
import { TOUCH_FREQUENCY_LABELS } from "@/lib/touch-frequency";

export const metadata: Metadata = { title: "Пора связаться · Relma" };

const DAY_FORMS = ["день", "дня", "дней"] as const;

export default function KeepInTouchPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pt-4 pb-16 lg:px-10 lg:pt-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
        <Link href="/">
          <ArrowLeftIcon />
          Все контакты
        </Link>
      </Button>
      <h1 className="mb-6 text-3xl leading-heading font-extrabold tracking-heading lg:mb-8 lg:text-5xl lg:tracking-display">
        Пора связаться
      </h1>
      <Suspense fallback={<OverdueListSkeleton />}>
        <OverdueList />
      </Suspense>
    </main>
  );
}

async function OverdueList() {
  // Overdue depends on the current time: compute on every request, never at build time
  await connection();
  const contacts = await listOverdueContacts();

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-muted px-6 py-16 text-center">
        <span className="mb-1 flex size-12 items-center justify-center rounded-lg bg-lime text-on-lime">
          <HeartHandshakeIcon className="size-6" />
        </span>
        <p className="text-lg font-bold">Все на связи — никого не пора догонять</p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/">Все контакты</Link>
        </Button>
      </div>
    );
  }

  return (
    <section aria-label="Контакты, с которыми пора связаться">
      <p className="-mt-3 mb-6 text-muted-foreground lg:-mt-5 lg:mb-8 lg:text-lg">
        С этими людьми вы не общались дольше, чем хотели. Сверху — самые давние.
      </p>
      <div className="rounded-3xl bg-muted p-2 lg:p-3">
        <ul className="divide-y-2 divide-muted overflow-hidden rounded-2xl bg-card">
          {contacts.map((contact) => (
            <OverdueRow key={contact.id} contact={contact} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function OverdueRow({ contact }: { contact: OverdueContact }) {
  const days = formatCount(contact.daysSince, DAY_FORMS);
  const since = contact.hasNotes
    ? `не общались ${days}`
    : `заметок нет · частота задана ${days} назад`;

  return (
    <li>
      <Link
        href={`/contacts/${contact.id}`}
        className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none lg:gap-4 lg:px-4"
      >
        <ContactAvatar id={contact.id} name={contact.name} />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-bold">{contact.name}</span>
          <p className="text-sm text-muted-foreground">
            {TOUCH_FREQUENCY_LABELS[contact.touchFrequency]} · {since}
          </p>
        </div>
        <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    </li>
  );
}

function OverdueListSkeleton() {
  return (
    <div aria-busy aria-label="Загружаем список" className="grid gap-2 rounded-3xl bg-muted p-2 lg:p-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl bg-background" />
      ))}
    </div>
  );
}
