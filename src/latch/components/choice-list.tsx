"use client";

import { useId } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import type { Choice, LatchState } from "@/latch/types";
import { StateLine } from "@/latch/components/surface";

export type ChoiceListProps = {
  label: string;
  options: Choice[];
  value?: string;
  state?: LatchState;
  errorMessage?: string;
  rerouteMessage?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function ChoiceList({
  label,
  options,
  value,
  state = "idle",
  errorMessage,
  rerouteMessage,
  onChange,
  className,
}: ChoiceListProps) {
  const id = useId();
  const locked = state === "loading" || state === "confirmed";

  return (
    <div data-slot="choice-list" data-state={state} className={className}>
      <p id={id} className="text-[13px] leading-5 text-muted">
        {label}
      </p>
      <div className="mt-1">
        <StateLine
          state={state}
          loadingMessage="Loading choices…"
          errorMessage={errorMessage ?? (state === "error" ? "Couldn't load choices." : undefined)}
          rerouteMessage={rerouteMessage}
          needsMessage={state === "needs-input" ? "Choose one." : undefined}
        />
      </div>
      {state === "loading" ? null : (
        <RadioGroup.Root
          aria-labelledby={id}
          value={value}
          onValueChange={onChange}
          disabled={locked}
          className="mt-1 border-t border-line"
        >
          {options.map((option) => {
            const itemId = `${id}-${option.value}`;
            const selected = value === option.value;
            return (
              <div key={option.value} className="flex items-start gap-3 border-b border-line py-2">
                <RadioGroup.Item
                  id={itemId}
                  value={option.value}
                  aria-label={option.label}
                  className="mt-0.5 size-3.5 shrink-0 rounded-full border border-line-strong outline-none focus-visible:ring-2 focus-visible:ring-accent data-[state=checked]:border-ink"
                >
                  <RadioGroup.Indicator className="flex size-full items-center justify-center">
                    <span className="size-1.5 rounded-full bg-ink" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
                <label htmlFor={itemId} className="min-w-0 flex-1 cursor-pointer">
                  <span className={cn("block text-[13px] leading-5", selected ? "text-ink" : "text-ink")}>
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 block text-[12px] leading-4 text-muted">{option.description}</span>
                  ) : null}
                  {selected && state === "confirmed" ? (
                    <span className="mt-0.5 block text-[12px] leading-4 text-ok">Selected</span>
                  ) : null}
                </label>
              </div>
            );
          })}
        </RadioGroup.Root>
      )}
    </div>
  );
}
