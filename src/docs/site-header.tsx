"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { nav } from "@/docs/content";

function subscribeTheme(onChange: () => void) {
  window.addEventListener("latch-theme", onChange);
  return () => window.removeEventListener("latch-theme", onChange);
}

function themeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, themeSnapshot, () => false);

  useEffect(() => {
    const stored = window.localStorage.getItem("latch-theme") === "dark";
    document.documentElement.classList.toggle("dark", stored);
    if (stored) window.dispatchEvent(new Event("latch-theme"));
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("latch-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("latch-theme"));
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-30 focus:bg-surface focus:px-2 focus:py-1 focus:text-[13px]"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-12 max-w-[1120px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="text-[14px] font-medium tracking-[-0.02em]">
          Latch
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex">
          {nav
            .filter((item) => item.href !== "/")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn("text-[13px] leading-5", pathname === item.href ? "text-ink" : "text-muted hover:text-ink")}
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={dark}
            className="h-7 rounded-[6px] px-2 text-[13px] text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            {dark ? "Light" : "Dark"}
          </button>
          <button
            type="button"
            className="h-7 rounded-[6px] px-2 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-1 text-[14px] leading-5" aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className="hidden w-[200px] shrink-0 lg:block">
      <div className="sticky top-12 py-8">
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn("block py-1 text-[13px] leading-5", pathname === item.href ? "text-ink" : "text-muted hover:text-ink")}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
