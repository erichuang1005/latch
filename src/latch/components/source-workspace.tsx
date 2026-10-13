"use client";

import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { LatchState } from "@/latch/types";

export type SourceLine = {
  id: string;
  text: string;
  aside?: string;
  speaker?: string;
  time?: string;
};

export type SourceDocument = {
  id: string;
  kind: string;
  title: string;
  meta: string;
  /** Uploaded filename, shown in the viewer. Falls back to the title. */
  fileName?: string;
  lines: SourceLine[];
  /** Line to show when this file is opened from the stack, before any figure has been chosen. */
  entryLineId?: string;
};

type ActiveSource = {
  documentId: string;
  lineId: string;
};

type SourceContextValue = {
  documents: SourceDocument[];
  active: ActiveSource;
  /** The canvas stays closed until a figure is opened. */
  open: boolean;
  activate: (documentId: string, lineId: string) => void;
  openDocument: (documentId: string) => void;
  close: () => void;
  /** Front card first. The previous front sits at the end while it flies off. */
  order: string[];
  leavingId: string | null;
  /** True for one frame so the flown card settles behind the deck without sliding back over it. */
  snap: boolean;
};

const SourceContext = createContext<SourceContextValue | null>(null);

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) pages.push(items.slice(index, index + size));
  return pages;
}

const PREVIEW_WIDTH = 196;
const LINES_PER_PAGE = 11;

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function placePreview(anchor: DOMRect, height: number) {
  const margin = 8;
  const gap = 12;
  const header = 56;
  const left = Math.min(Math.max(margin, anchor.left + anchor.width / 2 - PREVIEW_WIDTH / 2), window.innerWidth - PREVIEW_WIDTH - margin);
  const above = anchor.top - height - gap;
  const below = anchor.bottom + gap;
  const fitsAbove = above >= header;
  const fitsBelow = below + height <= window.innerHeight - margin;
  const top = fitsAbove ? above : fitsBelow ? below : Math.max(header, window.innerHeight - height - margin);
  return { left, top };
}

export function SourceWorkspace({
  documents,
  initialDocument,
  initialLine,
  state = "idle",
  pane = "page",
  children,
  className,
}: {
  documents: SourceDocument[];
  initialDocument: string;
  initialLine: string;
  state?: LatchState;
  pane?: "page" | "embedded";
  children: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState<ActiveSource>({ documentId: initialDocument, lineId: initialLine });
  const [open, setOpen] = useState(false);
  const initialOrder = orderWithFront(
    documents.map((item) => item.id),
    initialDocument,
  );
  const [order, setOrder] = useState(initialOrder);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [snap, setSnap] = useState(false);
  const remembered = useRef<Record<string, string>>({ [initialDocument]: initialLine });
  const orderRef = useRef(initialOrder);
  const flightTimer = useRef<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (flightTimer.current) window.clearTimeout(flightTimer.current);
    };
  }, []);

  function lineFor(documentId: string) {
    const doc = documents.find((item) => item.id === documentId);
    return remembered.current[documentId] ?? doc?.entryLineId ?? doc?.lines[0]?.id ?? "";
  }

  function beginFlight(previousId: string) {
    if (prefersReducedMotion()) return;
    if (flightTimer.current) window.clearTimeout(flightTimer.current);
    setSnap(false);
    setLeavingId(previousId);
    flightTimer.current = window.setTimeout(() => {
      if (!mounted.current) return;
      setSnap(true);
      setLeavingId(null);
      window.requestAnimationFrame(() => {
        if (!mounted.current) return;
        window.requestAnimationFrame(() => {
          if (mounted.current) setSnap(false);
        });
      });
    }, FLIGHT_MS);
  }

  function focusDocument(documentId: string) {
    const known = documents.map((item) => item.id);
    const base = orderRef.current.filter((id) => known.includes(id));
    for (const id of known) if (!base.includes(id)) base.push(id);
    if (base[0] === documentId) {
      orderRef.current = base;
      setOrder(base);
      return;
    }
    const without = base.filter((id) => id !== documentId);
    const previous = without[0] ?? null;
    const next = previous ? [documentId, ...without.slice(1), previous] : [documentId];
    orderRef.current = next;
    setOrder(next);
    if (previous) beginFlight(previous);
  }

  function activate(documentId: string, lineId: string) {
    remembered.current[documentId] = lineId;
    setActive({ documentId, lineId });
    setOpen(true);
    focusDocument(documentId);
  }

  function openDocument(documentId: string) {
    activate(documentId, lineFor(documentId));
  }

  function close() {
    if (flightTimer.current) window.clearTimeout(flightTimer.current);
    setLeavingId(null);
    setSnap(false);
    setOpen(false);
  }

  return (
    <SourceContext.Provider value={{ documents, active, open, activate, openDocument, close, order, leavingId, snap }}>
      <div
        className={cn(
          "lg:grid lg:h-full lg:min-h-0 lg:items-stretch",
          open ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]" : "lg:grid-cols-1",
          className,
        )}
      >
        <div className="min-w-0 lg:h-full lg:min-h-0">{children}</div>
        {open ? <SourceCanvas state={state} pane={pane} /> : null}
      </div>
    </SourceContext.Provider>
  );
}

export function Cite({
  documentId,
  lineId,
  label,
  children,
}: {
  documentId: string;
  lineId: string;
  label: string;
  children: ReactNode;
}) {
  const source = useContext(SourceContext);
  const doc = source?.documents.find((item) => item.id === documentId);
  const active = Boolean(source?.open && source.active.documentId === documentId && source.active.lineId === lineId);
  const name = doc ? `${label}, ${doc.title}` : label;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, r: 0 });
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);

  function place() {
    const node = buttonRef.current;
    if (!node) return;
    const height = previewRef.current?.offsetHeight ?? 220;
    setAnchor(placePreview(node.getBoundingClientRect(), height));
  }

  function show() {
    setOpen(true);
  }

  function hide() {
    setOpen(false);
    setTilt({ x: 0, y: 0, r: 0 });
  }

  function track(event: MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = rect.width ? (event.clientX - rect.left) / rect.width - 0.5 : 0;
    const dy = rect.height ? (event.clientY - rect.top) / rect.height - 0.5 : 0;
    setTilt({ x: dx * 15, y: dy * 10, r: dx * 12 });
  }

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, documentId, lineId]);

  useEffect(() => {
    if (!open) return;
    function onMove() {
      place();
    }
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-slot="cite"
        data-active={active || undefined}
        aria-current={active ? "true" : undefined}
        aria-label={name}
        onMouseEnter={show}
        onMouseMove={track}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => source?.activate(documentId, lineId)}
        className={cn(
          "mx-0.5 inline-flex translate-y-[-1px] items-baseline rounded-[5px] border px-1 align-baseline text-[15px] leading-6 outline-none focus-visible:ring-2 focus-visible:ring-accent",
          active ? "border-ink bg-ink text-surface" : "border-line bg-bg text-ink hover:border-line-strong",
        )}
      >
        {children}
      </button>
      {open && doc ? <DocHoverPreview doc={doc} lineId={lineId} tilt={tilt} anchor={anchor} previewRef={previewRef} /> : null}
    </>
  );
}

function DocHoverPreview({
  doc,
  lineId,
  tilt,
  anchor,
  previewRef,
}: {
  doc: SourceDocument;
  lineId: string;
  tilt: { x: number; y: number; r: number };
  anchor: { left: number; top: number } | null;
  previewRef: RefObject<HTMLDivElement | null>;
}) {
  const lineIndex = Math.max(0, doc.lines.findIndex((line) => line.id === lineId));
  const pageNumber = Math.floor(lineIndex / LINES_PER_PAGE);
  const page = chunk(doc.lines, LINES_PER_PAGE)[pageNumber] ?? [];
  const local = Math.max(0, page.findIndex((line) => line.id === lineId));
  const excerpt = page.slice(Math.max(0, local - 1), Math.max(0, local - 1) + 3);
  const fileName = doc.fileName ?? doc.title;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={previewRef}
      data-testid="source-preview"
      aria-hidden
      className="pointer-events-none fixed z-40 motion-safe:animate-[latch-preview-in_0.2s_ease-out] motion-reduce:animate-none"
      style={{
        left: anchor?.left ?? -9999,
        top: anchor?.top ?? 0,
        width: PREVIEW_WIDTH,
        transform: prefersReducedMotion() ? undefined : `translate(${tilt.x}px, ${tilt.y}px) rotate(${tilt.r}deg)`,
      }}
    >
      <div className="overflow-hidden rounded-[12px] border border-line bg-bg shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)]">
        <article className="max-h-[156px] overflow-hidden bg-surface px-3 pb-2 pt-3 font-serif">
          <p className="truncate border-b border-line pb-1 text-[10px] leading-4 text-faint">{fileName}</p>
          <div className="mt-2 space-y-1">
            {excerpt.map((line) => (
              <div key={line.id} className={cn("rounded-[3px] px-1 py-0.5", line.id === lineId && "bg-highlight")}>
                {line.speaker ? <p className="text-[10px] leading-4 text-muted">{line.speaker}</p> : null}
                <p className="line-clamp-2 text-[11px] leading-4 text-ink">
                  {line.text}
                  {line.aside ? <span className="float-right pl-2 tabular-nums">{line.aside}</span> : null}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] leading-4 text-faint">{pageNumber + 1}</p>
        </article>
        <p className="truncate px-3 py-1.5 text-[11px] leading-4 text-muted">
          {doc.kind} · {fileName}
        </p>
      </div>
    </div>,
    document.body,
  );
}

const VISIBLE = 4;
const FLIGHT_MS = 560;

function orderWithFront(ids: string[], frontId: string) {
  const start = Math.max(0, ids.indexOf(frontId));
  return [...ids.slice(start), ...ids.slice(0, start)];
}

/** Deck at rest: each sheet sits higher and turns a little, like a hand of cards. The front sheet flies down and off. */
function deckTransform(index: number, leaving: boolean) {
  if (leaving) return "translate3d(18%, 72%, 0) rotate(12deg) scale(0.94)";
  const turn = index === 0 ? 0 : index * 2.4;
  return `translate3d(0, ${-index * 14}px, 0) rotate(${turn}deg) scale(${1 - index * 0.035})`;
}

function PdfStack({ scroller }: { scroller: RefObject<HTMLDivElement | null> }) {
  const source = useContext(SourceContext);
  if (!source) return null;
  const { documents, active, openDocument, order, leavingId, snap } = source;
  const ordered = order.map((id) => documents.find((item) => item.id === id)).filter((item): item is SourceDocument => Boolean(item));

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = ordered[(delta + ordered.length) % ordered.length];
    if (next) openDocument(next.id);
  }

  return (
    <div role="group" aria-label="Files" onKeyDown={onKeyDown} className="relative min-h-0 flex-1 overflow-hidden bg-bg">
      <div className="absolute inset-0">
        {documents.map((item) => {
          const index = Math.max(0, order.indexOf(item.id));
          const name = item.fileName ?? item.title;
          const front = index === 0 && item.id !== leavingId;
          const leaving = item.id === leavingId;
          const buried = index >= VISIBLE && !leaving;
          const transition = snap ? "none" : leaving ? "transform 520ms cubic-bezier(0.16, 0.84, 0.3, 1)" : "transform 560ms cubic-bezier(0.22, 1.25, 0.36, 1)";
          return (
            <article
              key={item.id}
              aria-hidden={buried || undefined}
              className={cn(
                "absolute overflow-hidden rounded-[18px] border bg-surface shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.06)]",
                front ? "border-line-strong" : "border-line",
                (buried || leaving || !front) && "pointer-events-none",
                buried && "opacity-0",
              )}
              style={{
                top: 16,
                right: 28,
                bottom: 16,
                left: 16,
                transform: deckTransform(index, leaving),
                transformOrigin: "50% 100%",
                zIndex: leaving ? documents.length + 4 : documents.length - index,
                transition,
              }}
            >
              {front ? (
                <>
                  <button
                    type="button"
                    aria-current="true"
                    aria-label={`${name}, current file`}
                    onClick={() => openDocument(ordered[1]?.id ?? item.id)}
                    className="absolute inset-x-0 top-0 z-10 flex h-9 items-center border-b border-line bg-surface px-4 text-left font-serif outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="truncate text-[12px] leading-4 text-faint">{name}</span>
                  </button>
                  <div ref={scroller} tabIndex={0} data-testid="source-canvas" aria-label="Uploaded PDF" className="h-full overflow-y-auto pt-9 outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <PdfPages doc={item} lineId={active.lineId} sheet />
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    tabIndex={buried || leaving ? -1 : 0}
                    aria-label={`Open ${name}`}
                    onClick={() => openDocument(item.id)}
                    className="pointer-events-auto absolute inset-0 z-10 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="sr-only">{name}</span>
                  </button>
                  <div aria-hidden className="pointer-events-none h-full overflow-hidden">
                    <p className="truncate px-4 pt-3 font-serif text-[12px] leading-4 text-faint">{name}</p>
                    <PdfPages doc={item} lineId="" preview sheet />
                  </div>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: Math.min(0.22, index * 0.06) }} />
                </>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PdfPages({ doc, lineId, preview = false, sheet = false }: { doc: SourceDocument; lineId: string; preview?: boolean; sheet?: boolean }) {
  const pages = chunk(doc.lines, LINES_PER_PAGE).slice(0, preview ? 1 : undefined);
  return (
    <div className={sheet ? "" : "space-y-4 px-3 py-3"}>
      {pages.map((page, index) => (
        <article key={index} aria-label={preview ? undefined : `Page ${index + 1}`} className={cn("bg-surface font-serif", sheet ? "px-4 pb-4" : "border border-line px-5 pb-4 pt-5")}>
          {sheet ? null : <p className="truncate border-b border-line pb-2 text-[11px] leading-4 text-faint">{doc.fileName ?? doc.title}</p>}
          {index === 0 ? (
            preview ? (
              <p className={cn("text-[17px] font-medium leading-6", sheet ? "mt-1" : "mt-5")}>{doc.title}</p>
            ) : (
              <h3 className={cn("text-[17px] font-medium leading-6", sheet ? "mt-3" : "mt-5")}>{doc.title}</h3>
            )
          ) : null}
          <div className={cn("space-y-3", index === 0 ? "mt-4" : "mt-5")}>
            {(preview ? page.slice(0, 5) : page).map((line) => {
              const marked = !preview && line.id === lineId;
              return (
                <div key={line.id} data-line-id={preview ? undefined : line.id} className={cn("-mx-2 rounded-[4px] px-2 py-1", marked && "bg-highlight")}>
                  {line.speaker ? (
                    <p className="text-[12px] leading-4 text-muted">
                      {line.speaker}
                      {line.time ? <span className="text-faint"> · {line.time}</span> : null}
                    </p>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[13px] leading-5 text-ink">{line.text}</p>
                    {line.aside ? <p className="shrink-0 text-[13px] leading-5 tabular-nums text-ink">{line.aside}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
          {preview ? null : <p className="mt-6 text-center text-[11px] leading-4 text-faint">{index + 1}</p>}
        </article>
      ))}
    </div>
  );
}

function SourceCanvas({ state, pane }: { state: LatchState; pane: "page" | "embedded" }) {
  const source = useContext(SourceContext);
  const titleId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const doc = source?.documents.find((item) => item.id === source.active.documentId) ?? source?.documents[0];
  const lineId = source?.active.lineId;
  const pages = doc ? chunk(doc.lines, LINES_PER_PAGE) : [];
  const pageCount = Math.max(pages.length, 1);
  const pageIndex = Math.max(0, doc?.lines.findIndex((line) => line.id === lineId) ?? 0);
  const pageNumber = Math.floor(pageIndex / LINES_PER_PAGE) + 1;
  const fileName = doc?.fileName ?? doc?.title;

  useEffect(() => {
    const root = scroller.current;
    if (!root || !lineId || state === "loading" || state === "error" || state === "needs-input") return;
    const line = root.querySelector<HTMLElement>(`[data-line-id="${lineId}"]`);
    if (!line) return;
    const rootRect = root.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    const top = root.scrollTop + (lineRect.top - rootRect.top) - root.clientHeight / 2 + lineRect.height / 2;
    root.scrollTo?.({ top: Math.max(0, top), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [lineId, doc?.id, state]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      source?.close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [source]);

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={cn(
        "mt-8 flex flex-col border-t border-line bg-surface lg:mt-0 lg:border-l lg:border-t-0",
        pane === "embedded" ? "h-[480px]" : "h-[560px] lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)]",
      )}
    >
      <header className="shrink-0 border-b border-line px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] leading-4 text-muted">Uploaded PDF</p>
            <h2 id={titleId} className="mt-0.5 truncate text-[15px] font-medium leading-5">{fileName}</h2>
            <p className="mt-0.5 text-[12px] leading-4 text-faint">
              {doc?.meta}
              <span className="text-faint"> · Page {pageNumber} of {pageCount}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Close documents"
            onClick={() => source?.close()}
            className="shrink-0 rounded-[8px] border border-line px-2.5 py-1 text-[12px] leading-4 text-ink outline-none hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent"
          >
            Close
          </button>
        </div>
        {state === "confirmed" ? <p className="mt-2 text-[13px] leading-5 text-ok">Source checked.</p> : null}
        {state === "rerouted" ? <p className="mt-2 text-[13px] leading-5 text-warn">Opened from the new handler.</p> : null}
      </header>
      {state === "loading" ? <p className="px-4 py-5 text-[13px] leading-5 text-muted">Opening the file…</p> : null}
      {state === "error" ? (
        <p role="alert" className="px-4 py-5 text-[13px] leading-5 text-danger">
          This line is not in the file.
        </p>
      ) : null}
      {state === "needs-input" ? <p className="px-4 py-5 text-[13px] leading-5 text-muted">No file was attached to this figure.</p> : null}
      {state === "idle" || state === "confirmed" || state === "rerouted" ? <PdfStack scroller={scroller} /> : null}
    </div>
  );
}
