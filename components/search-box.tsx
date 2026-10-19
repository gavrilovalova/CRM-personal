"use client";

import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 250;

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);
  const [lastPushed, setLastPushed] = useState(urlQuery);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // The URL changed without typing (e.g. after adding a contact): show its query
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery !== lastPushed) {
      setValue(urlQuery);
      setLastPushed(urlQuery);
    }
  }

  const pushQuery = (next: string) => {
    const query = next.trim();
    setLastPushed(query);
    startTransition(() => {
      router.replace(query ? `/?q=${encodeURIComponent(query)}` : "/", { scroll: false });
    });
  };

  const handleChange = (next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => pushQuery(next), DEBOUNCE_MS);
  };

  const clear = () => {
    clearTimeout(timer.current);
    setValue("");
    pushQuery("");
    inputRef.current?.focus();
  };

  // "/" focuses the search field from anywhere on the page
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.closest("input, textarea, [contenteditable=true]");
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) clear();
        }}
        placeholder="Найти по имени…"
        aria-label="Поиск по имени"
        autoComplete="off"
        className="h-12 pr-12 pl-12 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
        {isPending ? (
          <Loader2Icon className="mr-1 size-4 animate-spin text-muted-foreground" aria-label="Ищем…" />
        ) : (
          value && (
            <button
              type="button"
              onClick={clear}
              className="rounded-sm p-1 text-muted-foreground hover:bg-border hover:text-foreground"
              aria-label="Очистить поиск"
            >
              <XIcon className="size-4" />
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function SearchBoxFallback() {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        disabled
        placeholder="Найти по имени…"
        aria-label="Поиск по имени"
        className="h-12 pl-12"
      />
    </div>
  );
}
