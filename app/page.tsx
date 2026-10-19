import { UserRoundIcon } from "lucide-react";
import { Suspense } from "react";

import { AddContactDialog } from "@/components/add-contact-dialog";
import { ContactList, ContactListSkeleton } from "@/components/contact-list";
import { SearchBox, SearchBoxFallback } from "@/components/search-box";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 pt-4 lg:px-10 lg:pt-6">
        <div className="flex items-center gap-2.5 lg:gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground lg:size-11 lg:rounded-lg">
            <UserRoundIcon className="size-5 lg:size-6" />
          </span>
          <span className="text-lg font-bold lg:text-xl">Relma</span>
        </div>
        <AddContactDialog />
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-8 pb-4 lg:px-10 lg:pt-14 lg:pb-6">
        <h1 className="text-3xl leading-display font-extrabold tracking-display sm:text-4xl lg:text-5xl">
          Люди, которых вы знаете{" "}
          <span className="inline-block -rotate-2 rounded-lg bg-primary px-2 text-primary-foreground lg:rounded-xl lg:px-3">
            лично
          </span>
        </h1>
      </div>

      {/* Stays on top while scrolling; letter headings in the list stick right below it (top-18) */}
      <div className="sticky top-0 z-20 h-18 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-5xl items-center px-5 lg:px-10">
          <div className="w-full">
            <Suspense fallback={<SearchBoxFallback />}>
              <SearchBox />
            </Suspense>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-5 pt-2 pb-16 lg:px-10">
        <Suspense fallback={<ContactListSkeleton />}>
          <ContactList searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
