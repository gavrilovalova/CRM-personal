"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteContact } from "@/app/actions";
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
import { formatCount } from "@/lib/format";

type DeleteContactButtonProps = {
  contactId: number;
  name: string;
  noteCount: number;
};

export function DeleteContactButton({ contactId, name, noteCount }: DeleteContactButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const whatIsDeleted =
    noteCount > 0
      ? `Контакт и ${formatCount(noteCount, ["его заметка", "его заметки", "его заметок"])} удалятся навсегда.`
      : "Контакт удалится навсегда.";

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteContact(contactId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setOpen(false);
      toast.success(`Контакт «${result.name}» удалён`);
      router.replace("/");
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Keep the dialog open while the deletion is in progress
        if (pending) return;
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="justify-self-start">
          <Trash2Icon />
          Удалить контакт
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить «{name}»?</DialogTitle>
          <DialogDescription>{whatIsDeleted} Вернуть их не получится.</DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={pending}>
              Отмена
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={confirmDelete}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending && <Loader2Icon className="animate-spin" />}
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
