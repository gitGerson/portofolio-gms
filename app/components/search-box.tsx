"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";

export function SearchBox({
  placeholder = "Cari produk…",
  variant = "light",
}: {
  placeholder?: string;
  /** "light" = white field (mobile forest header); "dark" = paper field (desktop). */
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`flex items-center gap-2.5 rounded-[13px] px-3.5 py-[11px] ${
        variant === "light"
          ? "bg-white"
          : "border border-line-strong bg-paper py-2.5"
      }`}
    >
      <SearchIcon size={17} className="text-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari produk"
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
      />
    </form>
  );
}
