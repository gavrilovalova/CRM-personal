import { SearchXIcon, UsersIcon } from "lucide-react";

import { ContactRows } from "@/components/contact-rows";
import { ShowMoreButton } from "@/components/show-more-button";
import { Skeleton } from "@/components/ui/skeleton";
import { countContacts, getContactPosition, listContacts } from "@/db/queries";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

const CONTACT_FORMS = ["контакт", "контакта", "контактов"] as const;
// Genitive forms for "из N …": "из 1 001 контакта", "из 1 000 контактов"
const OF_CONTACT_FORMS = ["контакта", "контактов", "контактов"] as const;

// How many contacts the list shows at first and adds on every "Показать ещё"
const PAGE_SIZE = 5;

type SearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function ContactList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = firstValue(params.q)?.trim() ?? "";
  const addedId = Number(firstValue(params.added)) || null;
  const limit = await resolveLimit(Number(firstValue(params.limit)), query ? null : addedId);

  const [items, found, total] = await Promise.all([
    listContacts(query, limit),
    countContacts(query),
    countContacts(),
  ]);

  return (
    <section aria-label="Список контактов">
      {/* A label as on the landing: lime for the whole list, pink for search results */}
      <h2
        className={cn(
          "mb-4 inline-flex rounded-full px-3.5 py-2 text-sm font-bold",
          query ? "bg-pink" : "bg-lime",
        )}
      >
        {query ? (
          <>
            Найдено: {found.toLocaleString("ru-RU")} из {formatCount(total, OF_CONTACT_FORMS)}
          </>
        ) : (
          <>Все контакты · {formatCount(total, CONTACT_FORMS)}</>
        )}
      </h2>

      {items.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ContactRows items={items} highlightedId={addedId} />
      )}

      {items.length < found && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <ShowMoreButton href={showMoreHref(params, items.length + PAGE_SIZE)} />
          <p className="text-sm text-muted-foreground">
            Показаны {items.length.toLocaleString("ru-RU")} из {found.toLocaleString("ru-RU")}
          </p>
        </div>
      )}
    </section>
  );
}

async function resolveLimit(requested: number, addedId: number | null) {
  let limit = Number.isInteger(requested) && requested > PAGE_SIZE ? requested : PAGE_SIZE;
  // A just added contact may be far down the list: show enough to include it
  if (addedId) {
    const position = await getContactPosition(addedId);
    if (position) limit = Math.max(limit, Math.ceil(position / PAGE_SIZE) * PAGE_SIZE);
  }
  return limit;
}

// Keeps the search query and the highlighted contact, only shows more rows
function showMoreHref(params: SearchParams, limit: number) {
  const next = new URLSearchParams();
  for (const key of ["q", "added"]) {
    const value = firstValue(params[key]);
    if (value) next.set(key, value);
  }
  next.set("limit", String(limit));
  return `/?${next}`;
}

function EmptyState({ query }: { query: string }) {
  const Icon = query ? SearchXIcon : UsersIcon;
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-muted px-6 py-16 text-center">
      <span
        className={cn(
          "mb-1 flex size-12 items-center justify-center rounded-lg",
          query ? "bg-pink" : "bg-primary text-primary-foreground",
        )}
      >
        <Icon className="size-6" />
      </span>
      {query ? (
        <>
          <p className="text-lg font-bold">Никого не нашли по запросу «{query}»</p>
          <p className="text-muted-foreground">
            Проверьте написание или поищите по части имени.
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-bold">Пока нет ни одного контакта</p>
          <p className="text-muted-foreground">
            Нажмите «Добавить контакт», чтобы записать первого человека.
          </p>
        </>
      )}
    </div>
  );
}

export function ContactListSkeleton() {
  return (
    <div aria-busy aria-label="Загружаем контакты">
      <Skeleton className="mb-4 h-9 w-56 rounded-full" />
      <div className="rounded-3xl bg-muted p-2 pt-13 lg:p-3 lg:pt-14">
        <div className="divide-y-2 divide-muted rounded-2xl bg-card">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-3 py-3 lg:gap-4 lg:px-4">
              <Skeleton className="size-11 rounded-full" />
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
