"use client";

import { useState } from "react";
import { RenewalAnswer } from "@/docs/cited-passage";
import { sampleDocuments } from "@/docs/sample-sources";
import { SourceWorkspace } from "@/latch/components/source-workspace";
import { ChoiceList } from "@/latch/components/choice-list";
import { ClarifyForm } from "@/latch/components/clarify-form";
import { ConfirmCard } from "@/latch/components/confirm-card";
import { HandoffCard } from "@/latch/components/handoff-card";
import { ItemSummary } from "@/latch/components/item-summary";
import { StatusPill, Toast } from "@/latch/components/status";
import { ThinkingSteps } from "@/latch/components/thinking-steps";
import type { Handler, LatchState, SummaryItem } from "@/latch/types";

const travel: Handler = { id: "travel", name: "Travel", detail: "Flights, rooms, and the group hold." };
const events: Handler = { id: "events", name: "Events", detail: "Venue, agenda, and the day-of plan." };

const rows = [
  { label: "Where", value: "Lisbon" },
  { label: "When", value: "12–16 May" },
  { label: "People", value: "12" },
  { label: "Plan", value: "€9,420" },
];

const planItems: SummaryItem[] = [
  { id: "flights", name: "Group fare to Lisbon", detail: "Per seat, mid May", quantity: 12, unitPrice: 310 },
  { id: "rooms", name: "Rooms in Alfama", detail: "Per room, 4 nights", quantity: 6, unitPrice: 840 },
  { id: "dinner", name: "Group dinner", detail: "Per person", quantity: 12, unitPrice: 55 },
];

export function ComponentPreview({ slug, state }: { slug: string; state: LatchState }) {
  switch (slug) {
    case "confirm-card":
      return <ConfirmPreview state={state} />;
    case "clarify-form":
      return <ClarifyPreview state={state} />;
    case "handoff":
      return <HandoffPreview state={state} />;
    case "thinking-steps":
      return <ThinkingPreview state={state} />;
    case "choice-list":
      return <ChoicePreview state={state} />;
    case "item-summary":
      return <SummaryPreview state={state} />;
    case "status":
      return <StatusPreview state={state} />;
    case "citation":
      return <CitationPreview state={state} />;
    default:
      return null;
  }
}

function ConfirmPreview({ state }: { state: LatchState }) {
  const [checked, setChecked] = useState(false);
  const [local, setLocal] = useState<LatchState>(state);
  return (
    <ConfirmCard
      title="Hold the Lisbon rooms"
      rows={state === "loading" ? [] : rows}
      checks={state === "loading" ? [] : ["Refundable until 1 May", "Names stay with you until you confirm"]}
      actionLabel="Confirm hold"
      state={local}
      errorMessage="The hold expired. Review it and confirm again."
      rerouteMessage="Rerouted from Travel to Events. Review the new plan before you confirm."
      acknowledgement={state === "needs-input" ? "I have read the hold terms." : undefined}
      acknowledgementChecked={checked}
      onAcknowledgementChange={(value) => {
        setChecked(value);
        if (value) setLocal("idle");
      }}
      onConfirm={() => setLocal("confirmed")}
    />
  );
}

function ClarifyPreview({ state }: { state: LatchState }) {
  const [answered, setAnswered] = useState(state === "confirmed" ? { label: "Budget", value: "€15,000" } : null);
  return (
    <ClarifyForm
      question="What budget should this stay under?"
      detail="City, month, and headcount are already in the brief."
      choices={[
        { value: "8000", label: "€8,000" },
        { value: "15000", label: "€15,000" },
        { value: "25000", label: "€25,000" },
      ]}
      allowCustom
      customLabel="Other amount"
      answerLabel="Budget"
      state={answered ? "confirmed" : state}
      answered={answered}
      collapsed={Boolean(answered)}
      errorMessage="That amount could not be checked. Try it again."
      rerouteMessage="Rerouted before an answer · Travel → Events"
      onSubmit={(answer) => setAnswered({ label: "Budget", value: answer.label })}
      onEdit={() => setAnswered(null)}
    />
  );
}

function HandoffPreview({ state }: { state: LatchState }) {
  const [current, setCurrent] = useState(state === "rerouted" ? events : travel);
  return (
    <HandoffCard
      handledBy={current}
      original={travel}
      alternatives={[events]}
      state={current.id === "events" ? "rerouted" : state}
      errorMessage="Couldn't reach Travel."
      onReroute={(next) => setCurrent(next.id === travel.id ? travel : next)}
    />
  );
}

function ThinkingPreview({ state }: { state: LatchState }) {
  const steps = [
    { id: "brief", label: "Reading the brief", status: "done" as const },
    { id: "facts", label: "Using 12 people, Lisbon, May", status: "done" as const },
    {
      id: "next",
      label:
        state === "error"
          ? "Couldn't check May availability"
          : state === "needs-input"
            ? "Waiting on a budget"
            : state === "rerouted"
              ? "Handed to Events"
              : "Drafting the hold",
      status: state === "error" ? ("error" as const) : state === "loading" || state === "needs-input" ? ("current" as const) : ("done" as const),
    },
  ];
  return <ThinkingSteps steps={steps} state={state} />;
}

function ChoicePreview({ state }: { state: LatchState }) {
  const [value, setValue] = useState(state === "confirmed" || state === "idle" ? "design" : undefined);
  return (
    <ChoiceList
      label="Which machine should the request cover?"
      options={[
        { value: "standard", label: "Standard laptop", description: "Enough for documents and calls." },
        { value: "design", label: "Design laptop", description: "More memory for large files." },
      ]}
      value={value}
      state={state}
      errorMessage="Couldn't load the catalog."
      rerouteMessage="Rerouted from IT to the design desk."
      onChange={setValue}
    />
  );
}

function SummaryPreview({ state }: { state: LatchState }) {
  const [items, setItems] = useState(state === "needs-input" ? planItems.map((item) => (item.id === "dinner" ? { ...item, quantity: 0 } : item)) : planItems);
  return (
    <ItemSummary
      items={items}
      state={state}
      errorMessage="A fare failed to load. The rest is still editable."
      rerouteMessage="Prices follow the new handler."
      onQuantityChange={(id, quantity) => setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)))}
    />
  );
}

function StatusPreview({ state }: { state: LatchState }) {
  const message =
    state === "confirmed" ? "Confirmed" : state === "error" ? "Failed" : state === "rerouted" ? "Rerouted" : state === "loading" ? "Saving" : "Added";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusPill state={state}>{message}</StatusPill>
      <Toast message={message} state={state} onDismiss={() => undefined} />
    </div>
  );
}

function CitationPreview({ state }: { state: LatchState }) {
  return (
    <SourceWorkspace documents={sampleDocuments} initialDocument="policy" initialLine="cap" state={state} pane="embedded">
      <div className="px-1 py-1">
        <RenewalAnswer detailed />
      </div>
    </SourceWorkspace>
  );
}
