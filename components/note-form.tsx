"use client";

import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";

import { addNote, type NoteFormState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/textarea";

const initialState: NoteFormState = { status: "idle" };

export function NoteForm({ contactId }: { contactId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [body, setBody] = useState("");
  const [state, formAction, pending] = useActionState(
    async (prev: NoteFormState, formData: FormData) => {
      const result = await addNote(contactId, prev, formData);
      if (result.status === "success") {
        setBody("");
        toast.success("Заметка сохранена");
      }
      return result;
    },
    initialState,
  );

  return (
    <form ref={formRef} action={formAction} className="grid gap-2">
      <label htmlFor="note-body" className="sr-only">
        Новая заметка
      </label>
      <Textarea
        id="note-body"
        name="body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          // Ctrl+Enter / Cmd+Enter saves the note
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        placeholder="Что обсудили, о чём договорились…"
        rows={3}
        className="min-h-24 resize-y bg-background"
        aria-invalid={state.status === "error" ? true : undefined}
        aria-describedby={state.status === "error" ? "note-error" : undefined}
      />
      <div className="flex items-center justify-between gap-3">
        {state.status === "error" ? (
          <p id="note-error" role="alert" className="text-xs text-destructive">
            {state.message}
          </p>
        ) : (
          <p className="hidden text-xs text-muted-foreground sm:block">Ctrl (⌘) + Enter — сохранить</p>
        )}
        <SubmitButton pending={pending} disabled={!body.trim()} className="ml-auto">
          Добавить заметку
        </SubmitButton>
      </div>
    </form>
  );
}
