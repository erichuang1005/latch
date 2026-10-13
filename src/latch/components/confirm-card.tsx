"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LatchState, SummaryRow } from "@/latch/types";
import { StateLine, surfaceClass } from "@/latch/components/surface";

export type ConfirmCardProps = {
  title: string;
  rows?: SummaryRow[];
  checks?: string[];
  actionLabel?: string;
  state?: LatchState;
  errorMessage?: string;
  rerouteMessage?: string;
  acknowledgement?: string;
  acknowledgementChecked?: boolean;
  onAcknowledgementChange?: (checked: boolean) => void;
  onConfirm?: () => void;
  className?: string;
};

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <path
        d="M2.4 6.2 4.7 8.5 9.6 3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ConfirmCard({
  title,
  rows = [],
  checks = [],
  actionLabel = "Confirm",
  state = "idle",
  errorMessage,
  rerouteMessage,
  acknowledgement,
  acknowledgementChecked,
  onAcknowledgementChange,
  onConfirm,
  className,
}: ConfirmCardProps) {
  const titleId = useId();
  const [uncontrolledChecked, setUncontrolledChecked] = useState(false);
  const checked = acknowledgementChecked ?? uncontrolledChecked;
  const waiting = state === "needs-input" && !!acknowledgement && !checked;
  const busy = state === "loading";
  const done = state === "confirmed";
  const label = done ? "Confirmed" : busy ? "Confirming…" : state === "error" ? "Confirm again" : actionLabel;

  return (
    <div
      role="group"
      data-slot="confirm-card"
      data-state={state}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      className={cn(surfaceClass, "px-3 py-3", className)}
    >
      <p id={titleId} className="text-[15px] font-medium leading-5 tracking-[-0.01em]">
        {title}
      </p>
      {busy && rows.length === 0 ? (
        <p className="mt-2 text-[13px] leading-5 text-muted">Preparing the review…</p>
      ) : null}
      {rows.length > 0 ? (
        <dl className="mt-2 border-t border-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-1.5">
              <dt className="shrink-0 text-[13px] leading-5 text-muted">{row.label}</dt>
              <dd className="text-right text-[13px] leading-5">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {checks.length > 0 ? (
        <ul aria-label="Included" className="mt-2.5 flex flex-wrap gap-1.5">
          {checks.map((check) => (
            <li
              key={check}
              className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[12px] leading-4 text-ok"
            >
              <CheckMark />
              {check}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-2.5 space-y-2">
        <StateLine
          state={state}
          errorMessage={errorMessage}
          rerouteMessage={rerouteMessage}
          needsMessage={waiting ? undefined : state === "needs-input" ? "Something is still missing before this can be confirmed." : undefined}
        />
        {done ? <p className="text-[13px] leading-5 text-ok">Confirmed by you.</p> : null}
        {acknowledgement ? (
          <label className="flex items-start gap-2 text-[13px] leading-5">
            <input
              type="checkbox"
              className="mt-0.5 size-3.5 accent-ink"
              checked={checked}
              onChange={(event) => {
                setUncontrolledChecked(event.target.checked);
                onAcknowledgementChange?.(event.target.checked);
              }}
              disabled={done || busy}
            />
            <span>{acknowledgement}</span>
          </label>
        ) : null}
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          onClick={onConfirm}
          disabled={busy || done || waiting || (state === "needs-input" && !acknowledgement)}
          aria-disabled={busy || done || waiting || undefined}
        >
          {done ? <CheckMark /> : null}
          {label}
        </Button>
      </div>
    </div>
  );
}
