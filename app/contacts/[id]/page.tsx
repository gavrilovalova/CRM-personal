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

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
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
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <ContactAvatar id={contact.id} name={contact.name} className="size-16 text-xl" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold break-words">{contact.name}</h1>
            {contact.about && <p className="text-muted-foreground">{contact.about}</p>}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
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

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
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
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
                <NotebookPenIcon className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Заметок пока нет. Запишите, о чём договорились после разговора.
                </p>
              </div>
            ) : (
              <ol className="grid gap-3">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-lg border bg-muted/30 px-4 py-3">
                    <time
                      dateTime={note.createdAt.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDateTime(note.createdAt)}
                    </time>
                    <p className="mt-1 text-sm whitespace-pre-wrap break-words">{note.body}</p>
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
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="grid gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
