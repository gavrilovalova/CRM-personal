import { z } from "zod";

const maxLength = (max: number) => `Не длиннее ${max} символов`;

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(200, maxLength(200)),
  about: z.string().trim().max(300, maxLength(300)),
  howWeMet: z.string().trim().max(300, maxLength(300)),
  phone: z
    .string()
    .trim()
    .max(40, maxLength(40))
    .refine(
      (value) => value === "" || /^\+?[\d\s()-]{5,}$/.test(value),
      "Телефон может содержать только цифры, пробелы, скобки, дефис и «+» в начале",
    ),
  email: z
    .string()
    .trim()
    .max(200, maxLength(200))
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Проверьте адрес почты — например, name@example.com",
    ),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
export type ContactField = keyof ContactInput;

export const CONTACT_FIELDS = Object.keys(contactInputSchema.shape) as ContactField[];

export const noteInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Напишите текст заметки")
    .max(5000, maxLength(5000)),
});
