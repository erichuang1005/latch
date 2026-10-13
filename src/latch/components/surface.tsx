import type { LatchState } from "@/latch/types";
import { cn } from "@/lib/utils";

export const surfaceClass =
  "rounded-[10px] border border-line bg-surface text-ink";

export function StateLine({
  state,
  errorMessage,
  rerouteMessage,
  loadingMessage,
  needsMessage,
}: {
  state?: LatchState;
  errorMessage?: string;
  rerouteMessage?: string;
  loadingMessage?: string;
  needsMessage?: string;
}) {
  if (state === "error" && errorMessage) {
    return (
      <p role="alert" className="text-[13px] leading-5 text-danger">
        {errorMessage}
      </p>
    );
  }
  if (state === "rerouted" && rerouteMessage) {
    return <p className="text-[13px] leading-5 text-warn">{rerouteMessage}</p>;
  }
  if (state === "loading" && loadingMessage) {
    return (
      <p className="text-[13px] leading-5 text-muted" aria-live="polite">
        {loadingMessage}
      </p>
    );
  }
  if (state === "needs-input" && needsMessage) {
    return <p className="text-[13px] leading-5 text-muted">{needsMessage}</p>;
  }
  return null;
}

export function stateNoteClass(state?: LatchState) {
  return cn(state === "error" && "border-danger/40");
}
