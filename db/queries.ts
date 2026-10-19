import "server-only";

import { asc, count, desc, eq, sql } from "drizzle-orm";

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
    .values(input)
    .returning({ id: contacts.id, name: contacts.name });
  return created;
}

export async function updateContact(id: number, input: ContactInput) {
  const [updated] = await db
    .update(contacts)
    .set(input)
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id, name: contacts.name });
  return updated ?? null;
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
