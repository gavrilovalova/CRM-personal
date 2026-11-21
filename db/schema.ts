import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// How often I want to keep in touch with a contact; null means "not set"
export const touchFrequency = pgEnum("touch_frequency", ["week", "month", "quarter", "year"]);

export const contacts = pgTable("contacts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  // Who this person is, e.g. "designer, Masha's friend"
  about: text("about").notNull().default(""),
  howWeMet: text("how_we_met").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  touchFrequency: touchFrequency("touch_frequency"),
  // When the frequency was last set or changed; the countdown starts here while there are no notes
  touchFrequencySetAt: timestamp("touch_frequency_set_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const notes = pgTable(
  "notes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notes_contact_id_created_at_idx").on(
      table.contactId,
      table.createdAt,
    ),
  ],
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Note = typeof notes.$inferSelect;
