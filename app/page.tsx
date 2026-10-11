import { BookUserIcon } from "lucide-react";
import { Suspense } from "react";

import { AddContactDialog } from "@/components/add-contact-dialog";
import { ContactList, ContactListSkeleton } from "@/components/contact-list";
import { SearchBox, SearchBoxFallback } from "@/components/search-box";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookUserIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-lg leading-tight font-semibold">Личная CRM</h1>
              <p className="text-sm text-muted-foreground">Люди, которых вы знаете лично</p>
            </div>
          </div>
          <AddContactDialog />
        </div>
      </header>

      {/* Stays on top while scrolling; letter headings in the list stick right below it (top-16) */}
      <div className="sticky top-0 z-20 h-16 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-full max-w-5xl items-center px-4">
          <div className="w-full">
            <Suspense fallback={<SearchBoxFallback />}>
              <SearchBox />
            </Suspense>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense fallback={<ContactListSkeleton />}>
          <ContactList searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
