"use client";

import { useId, useState, type FormEvent } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Choice, LatchState } from "@/latch/types";
import { StateLine, surfaceClass } from "@/latch/components/surface";

export type ClarifyAnswer = {
  value: string;
  label: string;
};

export type ClarifyFormProps = {
  question: string;
  detail?: string;
  choices?: Choice[];
  allowCustom?: boolean;
  customLabel?: string;
  answerLabel?: string;
  state?: LatchState;
  value?: string;
  customValue?: string;
  answered?: ClarifyAnswer | null;
  collapsed?: boolean;
  errorMessage?: string;
  rerouteMessage?: string;
  onChange?: (value: string) => void;
  onCustomChange?: (value: string) => void;
  onSubmit?: (answer: ClarifyAnswer) => void;
  onEdit?: () => void;
  className?: string;
};

export function ClarifyForm({
  question,
  detail,
  choices = [],
  allowCustom = false,
  customLabel = "Other",
  answerLabel = "Answer",
  state = "needs-input",
  value,
  customValue,
  answered = null,
  collapsed = false,
  errorMessage,
  rerouteMessage,
  onChange,
  onCustomChange,
  onSubmit,
  onEdit,
  className,
}: ClarifyFormProps) {
  const groupId = useId();
  const customId = useId();
  const [internalValue, setInternalValue] = useState(value ?? "");
  const [internalCustom, setInternalCustom] = useState(customValue ?? "");
  const [localError, setLocalError] = useState<string | null>(null);
  const selected = value ?? internalValue;
  const custom = customValue ?? internalCustom;
  const locked = state === "loading" || state === "confirmed";

  if (state === "rerouted") {
    return (
      <p data-slot="clarify-form" data-state={state} className={cn("text-[13px] leading-5 text-warn", className)}>
        {rerouteMessage ?? "Rerouted before an answer."}
      </p>
    );
  }

  if (answered && (collapsed || state === "confirmed")) {
    return (
      <div data-slot="clarify-form" data-state="confirmed" className={cn("flex items-baseline justify-between gap-3", className)}>
        <p className="text-[13px] leading-5">
          <span className="text-muted">{answered.label || answerLabel}</span>
          <span className="text-faint"> · </span>
          {answered.value}
        </p>
        {onEdit ? (
          <Button variant="ghost" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
      </div>
    );
  }

  function select(next: string) {
    setInternalValue(next);
    setInternalCustom("");
    onCustomChange?.("");
    onChange?.(next);
    setLocalError(null);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const typed = custom.trim();
    if (typed) {
      onSubmit?.({ value: typed, label: typed });
      return;
    }
    const choice = choices.find((item) => item.value === selected);
    if (!choice) {
      setLocalError("Choose one, or type an amount.");
      return;
    }
    onSubmit?.({ value: choice.value, label: choice.label });
  }

  return (
    <form
      data-slot="clarify-form"
      data-state={state}
      onSubmit={submit}
      className={cn(surfaceClass, "px-3 py-3", className)}
      aria-busy={state === "loading" || undefined}
    >
      <p className="text-[15px] font-medium leading-5 tracking-[-0.01em]">{question}</p>
      {detail ? <p className="mt-1 text-[13px] leading-5 text-muted">{detail}</p> : null}
      <StateLine
        state={state}
        loadingMessage="Checking that answer…"
        errorMessage={errorMessage ?? localError ?? undefined}
        needsMessage={state === "needs-input" ? "One answer unblocks the rest." : undefined}
      />
      {localError && state !== "error" ? (
        <p role="alert" className="mt-2 text-[13px] leading-5 text-danger">
          {localError}
        </p>
      ) : null}
      <RadioGroup.Root
        className="mt-3 flex flex-wrap gap-1.5"
        value={selected}
        onValueChange={select}
        disabled={locked}
        aria-label={question}
        id={groupId}
      >
        {choices.map((choice) => (
          <RadioGroup.Item
            key={choice.value}
            value={choice.value}
            className="h-7 rounded-full border border-line bg-surface px-2.5 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-surface disabled:opacity-40"
          >
            {choice.label}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      {allowCustom ? (
        <div className="mt-3">
          <label htmlFor={customId} className="text-[12px] leading-4 text-muted">
            {customLabel}
          </label>
          <Input
            id={customId}
            className="mt-1"
            value={custom}
            disabled={locked}
            inputMode="decimal"
            placeholder="Type an amount"
            onChange={(event) => {
              setInternalCustom(event.target.value);
              setInternalValue("");
              onChange?.("");
              onCustomChange?.(event.target.value);
              setLocalError(null);
            }}
          />
        </div>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Button type="submit" disabled={locked}>
          {state === "loading" ? "Checking…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
