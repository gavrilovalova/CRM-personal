"use client";

import { PencilIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { updateContact, type ContactFormState } from "@/app/actions";
import { ContactFields } from "@/components/contact-fields";
import { DeleteContactButton } from "@/components/delete-contact-button";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOUCH_FREQUENCY_LABELS, type TouchFrequency } from "@/lib/touch-frequency";
import type { ContactField } from "@/lib/validation";

type ContactDetailsProps = {
  // Form-ready values: an empty touchFrequency means "not set"
  contact: Record<ContactField, string> & { id: number };
  addedOn: string;
  noteCount: number;
};

export function ContactDetails({ contact, addedOn, noteCount }: ContactDetailsProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Данные контакта</CardTitle>
        {!editing && (
          <CardAction>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <PencilIcon />
              Изменить
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <EditContactForm contact={contact} onDone={() => setEditing(false)} />
        ) : (
          <div className="grid gap-6">
            <dl className="grid gap-5">
              <DetailRow label="Кто это" value={contact.about} />
              <DetailRow label="Откуда знакомы" value={contact.howWeMet} />
              <DetailRow
                label="Телефон"
                value={contact.phone}
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
              />
              <DetailRow label="Почта" value={contact.email} href={`mailto:${contact.email}`} />
              <DetailRow
                label="Как часто общаться"
                value={
                  contact.touchFrequency
                    ? TOUCH_FREQUENCY_LABELS[contact.touchFrequency as TouchFrequency]
                    : ""
                }
              />
              <DetailRow label="В контактах с" value={addedOn} />
            </dl>
            <div className="grid border-t pt-5">
              <DeleteContactButton contactId={contact.id} name={contact.name} noteCount={noteCount} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-bold tracking-caps text-subtle uppercase">{label}</dt>
      <dd className="text-base break-words">
        {!value ? (
          <span className="text-muted-foreground/70">не указано</span>
        ) : href ? (
          <a href={href} className="font-medium text-primary transition-colors hover:text-primary-hover">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

const initialState: ContactFormState = { status: "idle" };

function EditContactForm({
  contact,
  onDone,
}: {
  contact: ContactDetailsProps["contact"];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: ContactFormState, formData: FormData) => {
      const result = await updateContact(contact.id, prev, formData);
      if (result.status === "success") {
        toast.success("Изменения сохранены");
        onDone();
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <ContactFields
        idPrefix="edit-contact"
        defaults={state.values ?? contact}
        errors={state.fieldErrors}
        autoFocus
      />
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <SubmitButton pending={pending}>Сохранить</SubmitButton>
      </div>
    </form>
  );
}
