import "server-only";

import { and, asc, count, desc, eq, isNotNull, sql } from "drizzle-orm";

import { TOUCH_FREQUENCIES, TOUCH_FREQUENCY_DAYS } from "@/lib/touch-frequency";
import type { ContactInput } from "@/lib/validation";

import { db } from "./index";
import { contacts, notes } from "./schema";

// Case-insensitive name matching that treats "ё" and "е" as the same letter
const normalizeName = (value: string) => value.toLowerCase().replaceAll("ё", "е");
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

function nameFilter(query: string) {
  const search = normalizeName(query.trim());
  return search
    ? sql`replace(lower(${contacts.name}), 'ё', 'е') like ${`%${escapeLike(search)}%`}`
    : undefined;
}

// Alphabetical order of the list; the id keeps namesakes in a stable order
const nameOrder = sql`${contacts.name} collate "ru-x-icu"`;

export async function listContacts(query: string, limit: number) {
  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      about: contacts.about,
      howWeMet: contacts.howWeMet,
      phone: contacts.phone,
    })
    .from(contacts)
    .where(nameFilter(query))
    .orderBy(nameOrder, asc(contacts.id))
    .limit(limit);
}

export type ContactListItem = Awaited<ReturnType<typeof listContacts>>[number];

export async function countContacts(query = ""): Promise<number> {
  const [row] = await db.select({ value: count() }).from(contacts).where(nameFilter(query));
  return row.value;
}

/** 1-based position of the contact in the alphabetical list; null when it does not exist. */
export async function getContactPosition(id: number): Promise<number | null> {
  const ranked = db
    .select({
      id: contacts.id,
      position: sql<string>`row_number() over (order by ${nameOrder}, ${contacts.id})`.as("position"),
    })
    .from(contacts)
    .as("ranked");
  const [row] = await db.select({ position: ranked.position }).from(ranked).where(eq(ranked.id, id));
  // row_number() is a bigint, which the driver returns as a string
  return row ? Number(row.position) : null;
}

/**
 * Contacts it is time to reconnect with: a frequency is set and at least that many full days
 * have passed since the last note (or, with no notes, since the frequency was set or changed).
 * Days are counted by the database clock, so every browser sees the same result.
 */
function overdueContactsQuery() {
  const lastNotes = db
    .select({
      contactId: notes.contactId,
      lastNoteAt: sql<string>`max(${notes.createdAt})`.as("last_note_at"),
    })
    .from(notes)
    .groupBy(notes.contactId)
    .as("last_notes");

  const startedAt = sql`coalesce(${lastNotes.lastNoteAt}, ${contacts.touchFrequencySetAt})`;
  const daysSince = sql<number>`floor(extract(epoch from now() - ${startedAt}) / 86400)::int`;
  // Constants from code, inlined so Postgres compares integers rather than untyped parameters
  const periodDays = sql<number>`(case ${contacts.touchFrequency} ${sql.join(
    TOUCH_FREQUENCIES.map(
      (frequency) => sql.raw(`when '${frequency}' then ${TOUCH_FREQUENCY_DAYS[frequency]}`),
    ),
    sql` `,
  )} end)`;

  const query = db
    .select({
      id: contacts.id,
      name: contacts.name,
      touchFrequency: contacts.touchFrequency,
      daysSince: daysSince.as("days_since"),
      hasNotes: sql<boolean>`${lastNotes.lastNoteAt} is not null`.as("has_notes"),
    })
    .from(contacts)
    .leftJoin(lastNotes, eq(lastNotes.contactId, contacts.id))
    .where(and(isNotNull(contacts.touchFrequency), sql`${daysSince} >= ${periodDays}`));

  return { query, overdueDays: sql`${daysSince} - ${periodDays}` };
}

/** Most overdue first (days past the deadline); ties go alphabetically, as in the main list. */
export async function listOverdueContacts() {
  const { query, overdueDays } = overdueContactsQuery();
  const rows = await query.orderBy(desc(overdueDays), nameOrder, asc(contacts.id));
  // A frequency is always set here: the query filters out contacts without one
  return rows.map((row) => ({ ...row, touchFrequency: row.touchFrequency! }));
}

export type OverdueContact = Awaited<ReturnType<typeof listOverdueContacts>>[number];

export async function countOverdueContacts(): Promise<number> {
  const overdue = overdueContactsQuery().query.as("overdue");
  const [row] = await db.select({ value: count() }).from(overdue);
  return row.value;
}

export async function getContact(id: number) {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
  return contact ?? null;
}

export async function listNotes(contactId: number) {
  return db
    .select({ id: notes.id, body: notes.body, createdAt: notes.createdAt })
    .from(notes)
    .where(eq(notes.contactId, contactId))
    .orderBy(desc(notes.createdAt), desc(notes.id));
}

export async function createContact(input: ContactInput) {
  const [created] = await db
    .insert(contacts)
    .values({ ...input, touchFrequencySetAt: input.touchFrequency ? sql`now()` : null })
    .returning({ id: contacts.id, name: contacts.name });
  return created;
}

export async function updateContact(id: number, input: ContactInput) {
  const [updated] = await db
    .update(contacts)
    .set({
      ...input,
      // The countdown restarts only when the frequency actually changes; SET expressions see the old row
      touchFrequencySetAt: sql`case
        when ${input.touchFrequency}::touch_frequency is null then null
        when ${contacts.touchFrequency} is distinct from ${input.touchFrequency}::touch_frequency then now()
        else ${contacts.touchFrequencySetAt}
      end`,
    })
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id, name: contacts.name });
  return updated ?? null;
}

/** Deletes the contact with all its notes (cascade). Returns null when it does not exist. */
export async function deleteContact(id: number) {
  const [deleted] = await db
    .delete(contacts)
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id, name: contacts.name });
  return deleted ?? null;
}

/** Returns null when the contact does not exist. */
export async function addNote(contactId: number, body: string) {
  const [contact] = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(eq(contacts.id, contactId));
  if (!contact) return null;

  const [note] = await db
    .insert(notes)
    .values({ contactId, body })
    .returning({ id: notes.id });
  return note;
}
