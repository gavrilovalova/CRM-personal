"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";

import { createContact, type ContactFormState } from "@/app/actions";
import { ContactFields } from "@/components/contact-fields";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: ContactFormState = { status: "idle" };

export function AddContactDialog() {
  const [open, setOpen] = useState(false);
  const justCreated = useRef(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Smaller on phones so it fits in one row with the logo */}
        <Button size="lg" className="max-sm:h-10 max-sm:px-3.5 max-sm:text-sm">
          <PlusIcon className="max-sm:hidden" />
          Добавить контакт
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        onCloseAutoFocus={(event) => {
          // After a save, focus goes to the new row in the list instead of
          // back to the trigger button (which would scroll the page to the top)
          if (justCreated.current) {
            event.preventDefault();
            justCreated.current = false;
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Новый контакт</DialogTitle>
          <DialogDescription>
            Обязательно только имя — остальное можно дописать позже.
          </DialogDescription>
        </DialogHeader>
        {/* Rendered inside the dialog so every opening starts with a clean form */}
        <AddContactForm
          onCreated={() => {
            justCreated.current = true;
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddContactForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: ContactFormState, formData: FormData) => {
      const result = await createContact(prev, formData);
      if (result.status === "success" && result.contact) {
        const { id, name } = result.contact;
        onCreated();
        toast.success(`Контакт «${name}» добавлен`, {
          action: { label: "Открыть", onClick: () => router.push(`/contacts/${id}`) },
        });
        // Show the list without a search filter, with the new contact highlighted
        router.replace(`/?added=${id}`, { scroll: false });
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <ContactFields
        idPrefix="new-contact"
        defaults={state.values}
        errors={state.fieldErrors}
        autoFocus
      />
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Отмена
          </Button>
        </DialogClose>
        <SubmitButton pending={pending}>Добавить</SubmitButton>
      </DialogFooter>
    </form>
  );
}
