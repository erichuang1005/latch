import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LatchState } from "@/latch/types";

export type StatusTone = "neutral" | "success" | "danger" | "warning";

const tones: Record<StatusTone, string> = {
  neutral: "border-line text-ink",
  success: "border-line text-ok",
  danger: "border-line text-danger",
  warning: "border-line text-warn",
};

export function toneForState(state?: LatchState): StatusTone {
  if (state === "confirmed") return "success";
  if (state === "error") return "danger";
  if (state === "rerouted") return "warning";
  return "neutral";
}

export type StatusPillProps = {
  children: ReactNode;
  tone?: StatusTone;
  state?: LatchState;
  className?: string;
};

export function StatusPill({ children, tone, state, className }: StatusPillProps) {
  const resolved = tone ?? toneForState(state);
  return (
    <span
      data-slot="status-pill"
      data-state={state}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] leading-4",
        tones[resolved],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type ToastProps = {
  message: string;
  open?: boolean;
  tone?: StatusTone;
  state?: LatchState;
  onDismiss?: () => void;
  className?: string;
};

export function Toast({ message, open = true, tone, state, onDismiss, className }: ToastProps) {
  if (!open) return null;
  return (
    <div
      data-slot="toast"
      data-state={state}
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-1.5",
        className,
      )}
    >
      <StatusPill tone={tone} state={state}>
        {message}
      </StatusPill>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-[6px] px-1.5 text-[12px] text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
