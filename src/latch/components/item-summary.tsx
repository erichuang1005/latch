import { useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/latch/format";
import type { LatchState, SummaryItem } from "@/latch/types";
import { StateLine, surfaceClass } from "@/latch/components/surface";

export type ItemSummaryProps = {
  items: SummaryItem[];
  currency?: string;
  state?: LatchState;
  errorMessage?: string;
  rerouteMessage?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  className?: string;
};

export function ItemSummary({
  items,
  currency = "EUR",
  state = "idle",
  errorMessage,
  rerouteMessage,
  onQuantityChange,
  className,
}: ItemSummaryProps) {
  const titleId = useId();
  const locked = state === "loading" || state === "confirmed";
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, item.quantity) * item.unitPrice, 0);

  return (
    <div
      role="group"
      data-slot="item-summary"
      data-state={state}
      aria-labelledby={titleId}
      aria-busy={state === "loading" || undefined}
      className={cn(surfaceClass, "px-3 py-3", className)}
    >
      <p id={titleId} className="text-[15px] font-medium leading-5">
        Plan
      </p>
      <div className="mt-1">
        <StateLine
          state={state}
          loadingMessage="Updating the total…"
          errorMessage={errorMessage ?? (state === "error" ? "A price failed to load. The rest is still editable." : undefined)}
          rerouteMessage={rerouteMessage ?? (state === "rerouted" ? "Prices follow the new handler." : undefined)}
          needsMessage={state === "needs-input" ? "Set a quantity to include a line." : undefined}
        />
      </div>
      <ul className="mt-1 border-t border-line">
        {items.map((item) => {
          const removed = item.quantity <= 0;
          const line = removed ? 0 : item.quantity * item.unitPrice;
          return (
            <li key={item.id} className="flex items-center gap-3 border-b border-line py-2">
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-[13px] leading-5", removed && "text-muted")}>{item.name}</p>
                {item.detail ? <p className="truncate text-[12px] leading-4 text-muted">{item.detail}</p> : null}
              </div>
              <div role="group" aria-label={`Quantity for ${item.name}`} className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-6"
                  aria-label={`Decrease ${item.name}`}
                  disabled={locked || item.quantity <= 0}
                  onClick={() => onQuantityChange?.(item.id, Math.max(0, item.quantity - 1))}
                >
                  −
                </Button>
                <span className="w-6 text-center text-[13px] tabular-nums" aria-live="polite">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-6"
                  aria-label={`Increase ${item.name}`}
                  disabled={locked}
                  onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
              <p className="w-[4.75rem] shrink-0 text-right text-[13px] tabular-nums">
                {removed ? "—" : formatMoney(line, currency)}
              </p>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-[13px] text-muted">Subtotal</p>
        <p className="text-[15px] font-medium tabular-nums">{formatMoney(subtotal, currency)}</p>
      </div>
      {state === "confirmed" ? <p className="mt-2 text-[13px] leading-5 text-ok">Quantities locked.</p> : null}
    </div>
  );
}
