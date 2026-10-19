import { ArrowLeftIcon, MailIcon, NotebookPenIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { ContactDetails } from "@/components/contact-details";
import { NoteForm } from "@/components/note-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getContact, listNotes } from "@/db/queries";
import { formatCount, formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <main className="mx-auto max-w-5xl px-5 pt-4 pb-16 lg:px-10 lg:pt-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
        <Link href="/">
          <ArrowLeftIcon />
          Все контакты
        </Link>
      </Button>
      <Suspense fallback={<ContactSkeleton />}>
        <ContactView params={params} />
      </Suspense>
    </main>
  );
}

async function ContactView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contactId = Number(id);
  if (!Number.isInteger(contactId) || contactId <= 0) notFound();

  const [contact, notes] = await Promise.all([getContact(contactId), listNotes(contactId)]);
  if (!contact) notFound();

  return (
    <>
      {/* Grey card with white buttons, as the contact card on the landing's first screen */}
      <header className="mb-4 flex flex-col gap-5 rounded-3xl bg-muted p-5 sm:flex-row sm:items-center lg:mb-6 lg:rounded-4xl lg:p-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-5">
          <ContactAvatar
            id={contact.id}
            name={contact.name}
            className="size-16 text-xl lg:size-20 lg:text-2xl"
          />
          <div className="min-w-0">
            <h1 className="text-3xl leading-heading font-extrabold tracking-heading break-words lg:text-5xl lg:tracking-display">
              {contact.name}
            </h1>
            {contact.about && (
              <p className="mt-1 text-muted-foreground lg:mt-2 lg:text-lg">{contact.about}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {contact.phone && (
            <Button asChild variant="outline">
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                <PhoneIcon />
                Позвонить
              </a>
            </Button>
          )}
          {contact.email && (
            <Button asChild variant="outline">
              <a href={`mailto:${contact.email}`}>
                <MailIcon />
                Написать
              </a>
            </Button>
          )}
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6">
        <ContactDetails
          key={contact.updatedAt.toISOString()}
          contact={{
            id: contact.id,
            name: contact.name,
            about: contact.about,
            howWeMet: contact.howWeMet,
            phone: contact.phone,
            email: contact.email,
          }}
          addedOn={formatDate(contact.createdAt)}
        />

        <Card>
          <CardHeader>
            <CardTitle>Заметки</CardTitle>
            <CardDescription>
              {notes.length > 0
                ? formatCount(notes.length, ["заметка", "заметки", "заметок"])
                : "О чём говорили и о чём договорились"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <NoteForm contactId={contact.id} />
            {notes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted px-6 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-lg bg-lime">
                  <NotebookPenIcon className="size-6" />
                </span>
                <p className="text-muted-foreground">
                  Заметок пока нет. Запишите, о чём договорились после разговора.
                </p>
              </div>
            ) : (
              <ol className="grid gap-2.5">
                {notes.map((note, index) => (
                  <li key={note.id} className="rounded-xl bg-muted px-4 py-3.5 lg:px-5 lg:py-4">
                    {/* The newest note's date is highlighted, as in the landing's notes feed */}
                    <time
                      dateTime={note.createdAt.toISOString()}
                      className={cn("text-xs font-bold", index === 0 ? "text-primary" : "text-subtle")}
                    >
                      {formatDateTime(note.createdAt)}
                    </time>
                    <p className="mt-1 text-base leading-relaxed whitespace-pre-wrap break-words">
                      {note.body}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ContactSkeleton() {
  return (
    <div aria-busy aria-label="Загружаем карточку">
      <div className="mb-4 flex items-center gap-4 rounded-3xl bg-muted p-5 lg:mb-6 lg:gap-5 lg:rounded-4xl lg:p-8">
        <Skeleton className="size-16 rounded-full bg-background lg:size-20" />
        <div className="grid gap-2">
          <Skeleton className="h-8 w-56 bg-background lg:h-12 lg:w-80" />
          <Skeleton className="h-4 w-36 bg-background" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}
