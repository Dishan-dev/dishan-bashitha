"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const storageKey = "portfolio-theme";

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(storageKey); } catch { /* Storage may be unavailable. */ }
    document.documentElement.dataset.theme = saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light";
    onChange();
  };
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  media.addEventListener("change", sync);
  window.addEventListener("storage", sync);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", sync);
    window.removeEventListener("storage", sync);
  };
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "dark", () => false);
  const label = `Switch to ${dark ? "light" : "dark"} mode`;
  return (
    <button type="button" aria-label={label} title={label}
      onClick={() => {
        const theme = dark ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem(storageKey, theme); } catch { /* Keep the toggle usable without storage. */ }
      }}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
      {dark ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  );
}
