import { SearchXIcon, UsersIcon } from "lucide-react";

import { ContactRows } from "@/components/contact-rows";
import { Skeleton } from "@/components/ui/skeleton";
import { countContacts, listContacts } from "@/db/queries";
import { formatCount } from "@/lib/format";

const CONTACT_FORMS = ["контакт", "контакта", "контактов"] as const;
// Genitive forms for "из N …": "из 1 001 контакта", "из 1 000 контактов"
const OF_CONTACT_FORMS = ["контакта", "контактов", "контактов"] as const;

type SearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function ContactList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = firstValue(params.q)?.trim() ?? "";
  const addedId = Number(firstValue(params.added)) || null;

  const [items, total] = await Promise.all([listContacts(query), countContacts()]);

  return (
    <section aria-label="Список контактов">
      <div className="mb-3 flex items-baseline justify-between gap-4 px-1">
        <h2 className="text-sm font-medium text-muted-foreground">
          {query ? (
            <>
              Найдено: <span className="text-foreground">{items.length.toLocaleString("ru-RU")}</span> из{" "}
              {formatCount(total, OF_CONTACT_FORMS)}
            </>
          ) : (
            <>Все контакты · {formatCount(total, CONTACT_FORMS)}</>
          )}
        </h2>
      </div>

      {items.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ContactRows items={items} highlightedId={addedId} />
      )}
    </section>
  );
}

function EmptyState({ query }: { query: string }) {
  const Icon = query ? SearchXIcon : UsersIcon;
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" />
      {query ? (
        <>
          <p className="font-medium">Никого не нашли по запросу «{query}»</p>
          <p className="text-sm text-muted-foreground">
            Проверьте написание или поищите по части имени.
          </p>
        </>
      ) : (
        <>
          <p className="font-medium">Пока нет ни одного контакта</p>
          <p className="text-sm text-muted-foreground">
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
      <Skeleton className="mb-3 h-5 w-48" />
      <div className="rounded-xl border bg-card">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="size-9 rounded-full" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
