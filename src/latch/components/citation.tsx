"use client";

import { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";
import type { LatchState } from "@/latch/types";

export type CitationSource = {
  title: string;
  href?: string;
  detail?: string;
  quote?: string;
};

export type CitationProps = {
  title?: string;
  href?: string;
  detail?: string;
  quote?: string;
  text?: string;
  sources?: CitationSource[];
  state?: LatchState;
  className?: string;
};

function hostOf(href?: string) {
  if (!href) return "";
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeSources(props: CitationProps): CitationSource[] {
  if (props.sources && props.sources.length > 0) return props.sources;
  if (props.title) {
    return [{ title: props.title, href: props.href, detail: props.detail, quote: props.quote }];
  }
  return [];
}

function pillLabel(sources: CitationSource[]) {
  const host = hostOf(sources[0]?.href) || sources[0]?.title || "Source";
  if (sources.length > 1) return `${host} +${sources.length - 1}`;
  return host;
}

export function Citation({ text, state = "idle", className, ...props }: CitationProps) {
  const sources = normalizeSources(props);
  const label = pillLabel(sources);
  const [index, setIndex] = useState(0);
  const source = sources[Math.min(index, Math.max(sources.length - 1, 0))];
  const quiet = state === "loading" || state === "error" || state === "needs-input" || sources.length === 0;

  const pillClass = cn(
    "mx-1 inline-flex h-5 max-w-full translate-y-[-1px] items-center gap-1 rounded-full border border-line bg-bg px-1.5 align-middle text-[12px] leading-4 text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent",
    state === "error" && "text-danger",
    className,
  );

  function step(delta: number) {
    setIndex((current) => (current + delta + sources.length) % sources.length);
  }

  const claim = text ? <span>{text}</span> : null;

  if (quiet) {
    const quietLabel = state === "loading" ? "Loading source" : state === "error" ? "Source unavailable" : "Add a source";
    return (
      <span data-slot="citation" data-state={state} className="inline">
        {claim}
        <span role={state === "error" ? "alert" : undefined} aria-busy={state === "loading" || undefined} className={pillClass}>
          {quietLabel}
        </span>
      </span>
    );
  }

  return (
    <span data-slot="citation" data-state={state} className="inline">
      {claim}
      <HoverCard.Root openDelay={120} closeDelay={80}>
        <HoverCard.Trigger asChild>
          <button type="button" className={pillClass} aria-label={`${label}, ${sources.length === 1 ? "1 source" : `${sources.length} sources`}`}>
            <span aria-hidden className="flex size-3.5 shrink-0 items-center justify-center rounded-full border border-line text-[9px] leading-none text-muted">
              {label.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate">{label}</span>
          </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            sideOffset={6}
            collisionPadding={16}
            className="z-30 w-[min(320px,calc(100vw-2rem))] rounded-[10px] border border-line bg-surface text-ink outline-none"
            onKeyDown={(event) => {
              if (sources.length < 2) return;
              if (event.key === "ArrowRight") {
                event.preventDefault();
                step(1);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                step(-1);
              }
            }}
          >
            {sources.length > 1 ? (
              <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Previous source" className="text-[12px] leading-4 text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent" onClick={() => step(-1)}>
                    Prev
                  </button>
                  <button type="button" className="text-[12px] leading-4 text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent" onClick={() => step(1)} aria-label="Next source">
                    Next
                  </button>
                </div>
                <p className="text-[12px] leading-4 text-faint">
                  {index + 1}/{sources.length}
                </p>
              </div>
            ) : null}
            <div className="px-3 py-3">
              <p className="text-[14px] font-medium leading-5">{source.title}</p>
              {source.href ? (
                <a href={source.href} className="mt-1 block truncate text-[12px] leading-4 text-accent underline-offset-2 hover:underline">
                  {hostOf(source.href)}
                </a>
              ) : null}
              {source.detail ? <p className="mt-2 text-[13px] leading-5 text-muted">{source.detail}</p> : null}
              {source.quote ? (
                <blockquote className="mt-3 border-l border-line pl-3 text-[13px] leading-5 text-muted">{source.quote}</blockquote>
              ) : null}
              {state === "rerouted" ? <p className="mt-3 text-[13px] leading-5 text-warn">Cited by the new handler.</p> : null}
              {state === "confirmed" ? <p className="mt-3 text-[13px] leading-5 text-ok">Source checked.</p> : null}
            </div>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </span>
  );
}
