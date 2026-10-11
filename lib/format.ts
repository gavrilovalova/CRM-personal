const pluralRules = new Intl.PluralRules("ru-RU");

/** Picks the Russian plural form: [one, few, many], e.g. ["контакт", "контакта", "контактов"]. */
export function plural(count: number, forms: readonly [string, string, string]): string {
  const category = pluralRules.select(count);
  if (category === "one") return forms[0];
  if (category === "few") return forms[1];
  return forms[2];
}

export function formatCount(count: number, forms: readonly [string, string, string]): string {
  return `${count.toLocaleString("ru-RU")} ${plural(count, forms)}`;
}

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (date: Date) => dateFormat.format(date);
export const formatDateTime = (date: Date) => dateTimeFormat.format(date);

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0][0], parts[1][0]] : [parts[0]?.[0] ?? "?"];
  return letters.join("").toUpperCase();
}
