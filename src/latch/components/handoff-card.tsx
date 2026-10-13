"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Handler, LatchState, MisrouteLog } from "@/latch/types";
import { ChoiceList } from "@/latch/components/choice-list";
import { StateLine, surfaceClass } from "@/latch/components/surface";

export type HandoffCardProps = {
  handledBy: Handler;
  alternatives?: Handler[];
  original?: Handler;
  state?: LatchState;
  log?: MisrouteLog | null;
  errorMessage?: string;
  onReroute?: (next: Handler, log: MisrouteLog) => void;
  className?: string;
};

export function HandoffCard({
  handledBy,
  alternatives = [],
  original,
  state = "idle",
  log = null,
  errorMessage,
  onReroute,
  className,
}: HandoffCardProps) {
  const [open, setOpen] = useState(state === "needs-input");
  const options = [handledBy, ...alternatives.filter((item) => item.id !== handledBy.id)];
  const from = original ?? handledBy;
  const derived =
    log ??
    (original && original.id !== handledBy.id
      ? { from: original.name, to: handledBy.name }
      : state === "rerouted"
        ? { from: from.name, to: handledBy.name }
        : null);
  const showLog = Boolean(derived && (state === "rerouted" || (original && original.id !== handledBy.id) || log));
  const busy = state === "loading";
  const done = state === "confirmed";

  return (
    <section
      data-slot="handoff-card"
      data-state={showLog ? "rerouted" : state}
      aria-busy={busy || undefined}
      className={cn(surfaceClass, "px-3 py-3", className)}
    >
      <p className="text-[12px] leading-4 text-muted">Handled by</p>
      {busy ? (
        <p className="mt-1 text-[13px] leading-5 text-muted">Finding who should handle this…</p>
      ) : (
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-medium leading-5">{handledBy.name}</p>
            <p className="mt-0.5 text-[13px] leading-5 text-muted">{handledBy.detail}</p>
          </div>
          {done || alternatives.length === 0 ? null : (
            <Button
              variant="ghost"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Close" : "Not right? Change"}
            </Button>
          )}
        </div>
      )}
      <div className="mt-2 space-y-2">
        <StateLine
          state={state === "rerouted" ? "idle" : state}
          errorMessage={errorMessage ?? (state === "error" ? `Couldn't reach ${handledBy.name}.` : undefined)}
        />
        {done ? <p className="text-[13px] leading-5 text-ok">You kept this with {handledBy.name}.</p> : null}
        {showLog && derived ? (
          <p className="text-[13px] leading-5 text-warn">
            Logged as a misroute · {derived.from} → {derived.to}
          </p>
        ) : null}
      </div>
      {open && !busy && !done ? (
        <div className="mt-3">
          <ChoiceList
            label="Who should handle this?"
            options={options.map((item) => ({
              value: item.id,
              label: item.name,
              description: item.detail,
            }))}
            value={handledBy.id}
            state={state === "error" ? "idle" : state === "rerouted" ? "idle" : state}
            onChange={(id) => {
              const next = options.find((item) => item.id === id);
              if (!next) return;
              if (next.id !== (original?.id ?? handledBy.id)) {
                onReroute?.(next, { from: (original ?? handledBy).name, to: next.name });
              } else {
                onReroute?.(next, { from: next.name, to: next.name });
              }
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
