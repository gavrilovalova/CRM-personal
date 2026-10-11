"use server";

import { revalidatePath } from "next/cache";

import * as queries from "@/db/queries";
import {
  CONTACT_FIELDS,
  contactInputSchema,
  noteInputSchema,
  type ContactField,
} from "@/lib/validation";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  // Submitted values, so the form keeps what the user typed after a failed save
  values?: Partial<Record<ContactField, string>>;
  contact?: { id: number; name: string };
};

export type NoteFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const readString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

function parseContactForm(formData: FormData) {
  const values = Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, readString(formData, field)]),
  ) as Record<ContactField, string>;
  const parsed = contactInputSchema.safeParse(values);

  if (parsed.success) {
    return { values, data: parsed.data, fieldErrors: null };
  }

  const fieldErrors: Partial<Record<ContactField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ContactField;
    fieldErrors[field] ??= issue.message;
  }
  return { values, data: null, fieldErrors };
}

const isValidId = (id: number) => Number.isInteger(id) && id > 0;

export async function createContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, data, fieldErrors } = parseContactForm(formData);
  if (!data) {
    return { status: "error", message: "Проверьте поля формы", fieldErrors, values };
  }

  try {
    const contact = await queries.createContact(data);
    revalidatePath("/");
    return { status: "success", contact };
  } catch (error) {
    console.error("Failed to create contact", error);
    return { status: "error", message: "Не удалось сохранить контакт. Попробуйте ещё раз.", values };
  }
}

export async function updateContact(
  contactId: number,
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, data, fieldErrors } = parseContactForm(formData);
  if (!data) {
    return { status: "error", message: "Проверьте поля формы", fieldErrors, values };
  }
  if (!isValidId(contactId)) {
    return { status: "error", message: "Контакт не найден", values };
  }

  try {
    const contact = await queries.updateContact(contactId, data);
    if (!contact) {
      return { status: "error", message: "Контакт не найден", values };
    }
    revalidatePath("/");
    revalidatePath(`/contacts/${contactId}`);
    return { status: "success", contact };
  } catch (error) {
    console.error("Failed to update contact", error);
    return { status: "error", message: "Не удалось сохранить изменения. Попробуйте ещё раз.", values };
  }
}

export async function addNote(
  contactId: number,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const parsed = noteInputSchema.safeParse({ body: readString(formData, "body") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }
  if (!isValidId(contactId)) {
    return { status: "error", message: "Контакт не найден" };
  }

  try {
    const note = await queries.addNote(contactId, parsed.data.body);
    if (!note) {
      return { status: "error", message: "Контакт не найден" };
    }
    revalidatePath(`/contacts/${contactId}`);
    return { status: "success" };
  } catch (error) {
    console.error("Failed to add note", error);
    return { status: "error", message: "Не удалось сохранить заметку. Попробуйте ещё раз." };
  }
}
