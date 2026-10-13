"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Citation } from "@/latch/components/citation";
import { ClarifyForm, type ClarifyAnswer } from "@/latch/components/clarify-form";
import { ConfirmCard } from "@/latch/components/confirm-card";
import { HandoffCard } from "@/latch/components/handoff-card";
import { ItemSummary } from "@/latch/components/item-summary";
import { ThinkingSteps } from "@/latch/components/thinking-steps";
import { Toast } from "@/latch/components/status";
import { formatMoney } from "@/latch/format";
import type { Handler, SummaryItem, ThinkingStep } from "@/latch/types";

const PROMPT = "Plan a team offsite for 12 in Lisbon in May";

const HANDLERS: Record<string, Handler> = {
  travel: { id: "travel", name: "Travel", detail: "Flights, rooms, and the group hold." },
  events: { id: "events", name: "Events", detail: "Venue, agenda, and the day-of plan." },
  places: { id: "places", name: "Places", detail: "Neighborhood and the walking distance." },
};

const PLANS: Record<string, SummaryItem[]> = {
  travel: [
    { id: "flights", name: "Group fare to Lisbon", detail: "Per seat, mid May", quantity: 12, unitPrice: 310 },
    { id: "rooms", name: "Rooms in Alfama", detail: "Per room, 4 nights", quantity: 6, unitPrice: 840 },
    { id: "dinner", name: "Group dinner", detail: "Per person", quantity: 12, unitPrice: 55 },
  ],
  events: [
    { id: "venue", name: "Riverside room", detail: "One day", quantity: 1, unitPrice: 2200 },
    { id: "facilitation", name: "Facilitation", detail: "Two days", quantity: 2, unitPrice: 900 },
    { id: "dinner", name: "Group dinner", detail: "Per person", quantity: 12, unitPrice: 55 },
  ],
  places: [
    { id: "walk", name: "Neighborhood day", detail: "A guide for the group", quantity: 1, unitPrice: 480 },
    { id: "rooms", name: "Rooms in Alfama", detail: "Per room, 4 nights", quantity: 6, unitPrice: 840 },
    { id: "dinner", name: "Group dinner", detail: "Per person", quantity: 12, unitPrice: 55 },
  ],
};

const FIRST_STEPS: ThinkingStep[] = [
  { id: "brief", label: "Reading the brief", status: "done" },
  { id: "facts", label: "Using 12 people, Lisbon, May", status: "done" },
  { id: "gap", label: "One fact missing: budget", status: "current" },
];

const PLAN_STEPS: ThinkingStep[] = [
  { id: "budget", label: "Using the budget", status: "done" },
  { id: "hold", label: "Holding a refundable fare", status: "done" },
  { id: "draft", label: "Drafting the review", status: "current" },
];

type Phase = "ready" | "thinking" | "clarify" | "planning" | "review" | "confirmed";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function budgetNumber(answer: ClarifyAnswer) {
  const digits = answer.value.replace(/[^\d.]/g, "");
  return Number(digits || 0);
}

export function DemoAgent({ variant = "full" }: { variant?: "hero" | "full" }) {
  const [phase, setPhase] = useState<Phase>(variant === "hero" ? "thinking" : "ready");
  const [draft, setDraft] = useState(variant === "hero" ? PROMPT : "");
  const [sent, setSent] = useState(variant === "hero" ? PROMPT : "");
  const [budget, setBudget] = useState<ClarifyAnswer | null>(null);
  const [handler, setHandler] = useState<Handler>(HANDLERS.travel);
  const [items, setItems] = useState<SummaryItem[]>(PLANS.travel);
  const [run, setRun] = useState(0);
  const [toast, setToast] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (variant !== "hero") return;
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, prefersReducedMotion() ? 0 : ms),
      );
    };
    later(() => setPhase("clarify"), 800);
    later(() => {
      setBudget({ value: "15000", label: "€15,000" });
      setPhase("planning");
    }, 1800);
    later(() => setPhase("review"), 2600);
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [variant, run]);

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    const card = node.querySelector("[data-slot='confirm-card']");
    if (variant === "hero" && card && (phase === "review" || phase === "confirmed")) {
      const top = card.getBoundingClientRect().top - node.getBoundingClientRect().top + node.scrollTop;
      node.scrollTo({ top: Math.max(0, top - 8), behavior });
      return;
    }
    node.scrollTo({ top: node.scrollHeight, behavior });
  }, [phase, handler, budget, toast, variant]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function send(text: string) {
    const goal = text.trim();
    if (!goal) return;
    clearTimers();
    setSent(goal);
    setBudget(null);
    setHandler(HANDLERS.travel);
    setItems(PLANS.travel);
    setToast(false);
    setPhase("thinking");
    const id = window.setTimeout(() => setPhase("clarify"), prefersReducedMotion() ? 0 : 700);
    timers.current.push(id);
  }

  function answerBudget(answer: ClarifyAnswer) {
    setBudget({ value: String(budgetNumber(answer) || answer.value), label: answer.label });
    setPhase("planning");
    const id = window.setTimeout(() => setPhase("review"), prefersReducedMotion() ? 0 : 800);
    timers.current.push(id);
  }

  const subtotal = items.reduce((sum, item) => sum + Math.max(0, item.quantity) * item.unitPrice, 0);
  const budgetValue = budget ? budgetNumber(budget) : 0;
  const over = budgetValue > 0 ? subtotal - budgetValue : 0;
  const showWork = phase !== "ready";
  const showClarify = phase === "clarify" || phase === "planning" || phase === "review" || phase === "confirmed";
  const showPlanSteps = phase === "planning" || phase === "review" || phase === "confirmed";
  const showReview = phase === "review" || phase === "confirmed";
  const speaker = showReview ? handler.name : "Planner";

  const rows = [
    { label: "Where", value: "Lisbon" },
    { label: "When", value: "12–16 May" },
    { label: "People", value: "12" },
    { label: "Handler", value: handler.name },
    { label: "Budget", value: budget?.label ?? "—" },
    { label: "Plan", value: formatMoney(subtotal) },
    {
      label: "Against budget",
      value: over > 0 ? `${formatMoney(over)} over` : "Inside the budget",
    },
  ];

  return (
    <div data-testid="demo" data-phase={phase} className={variant === "hero" ? "" : "mx-auto w-full max-w-[640px]"}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] leading-4 text-muted">
          <span className="text-faint">Reference </span>
          Offsite brief · 12 people, Lisbon, a week in May
        </p>
        {variant === "hero" ? (
          <Button
            variant="ghost"
            onClick={() => {
              setSent(PROMPT);
              setDraft(PROMPT);
              setBudget(null);
              setHandler(HANDLERS.travel);
              setItems(PLANS.travel.map((item) => ({ ...item })));
              setToast(false);
              setPhase("thinking");
              setRun((value) => value + 1);
            }}
          >
            Replay
          </Button>
        ) : null}
      </div>
      <div className="mt-2">
        <Citation title="City fair calendar" href={variant === "full" ? "#city-fair-calendar" : undefined} />
      </div>
      <div
        ref={scroller}
        tabIndex={variant === "hero" ? 0 : undefined}
        aria-label={variant === "hero" ? "Demo transcript" : undefined}
        className={
          variant === "hero"
            ? "mt-4 h-auto overflow-visible pr-1 outline-none focus-visible:ring-2 focus-visible:ring-accent lg:h-[440px] lg:overflow-x-hidden lg:overflow-y-auto"
            : "mt-6"
        }
      >
        {phase === "ready" ? (
          <p className="text-[13px] leading-5 text-muted">The agent has the brief. It will not ask for anything the brief already answers.</p>
        ) : null}
        {sent ? (
          <div className="flex justify-end">
            <p className="max-w-[40ch] text-right text-[15px] leading-6">{sent}</p>
          </div>
        ) : null}
        {showWork ? (
          <div className="mt-6">
            <p className="text-[12px] leading-4 text-muted">{speaker}</p>
            <div className="mt-2">
              <ThinkingSteps steps={FIRST_STEPS.map((step) => ({ ...step, status: phase === "thinking" ? step.status : "done" }))} state={phase === "thinking" ? "loading" : "confirmed"} />
            </div>
            {showClarify ? (
              <p className="mt-3 max-w-[62ch] text-[15px] leading-6">
                Twelve people, Lisbon, a week in May. May is the busiest fair month, so I would hold rooms before naming anyone. I still need a budget.
              </p>
            ) : null}
            {showClarify ? (
              <div className="mt-3">
                <ClarifyForm
                  question="What budget should this stay under?"
                  detail="City, month, and headcount are already in the brief."
                  answerLabel="Budget"
                  choices={[
                    { value: "8000", label: "€8,000" },
                    { value: "15000", label: "€15,000" },
                    { value: "25000", label: "€25,000" },
                  ]}
                  allowCustom
                  customLabel="Other amount"
                  value={budget?.value}
                  state={phase === "clarify" ? "needs-input" : "confirmed"}
                  answered={budget ? { label: "Budget", value: budget.label } : null}
                  collapsed={phase !== "clarify"}
                  onSubmit={answerBudget}
                  onEdit={() => setPhase("clarify")}
                />
              </div>
            ) : null}
            {showPlanSteps ? (
              <div className="mt-4">
                <ThinkingSteps
                  steps={PLAN_STEPS.map((step) => ({ ...step, status: phase === "planning" ? step.status : "done" }))}
                  state={phase === "planning" ? "loading" : "confirmed"}
                />
              </div>
            ) : null}
            {showReview ? (
              <div className="mt-4 space-y-3">
                <HandoffCard
                  handledBy={handler}
                  original={HANDLERS.travel}
                  alternatives={[HANDLERS.events, HANDLERS.places]}
                  state={handler.id === "travel" ? "idle" : "rerouted"}
                  onReroute={(next, log) => {
                    if (log.from === log.to) {
                      setHandler(HANDLERS.travel);
                      setItems(PLANS.travel.map((item) => ({ ...item })));
                      return;
                    }
                    setHandler(next);
                    setItems((PLANS[next.id] ?? PLANS.travel).map((item) => ({ ...item })));
                  }}
                />
                <ItemSummary
                  items={items}
                  state={phase === "confirmed" ? "confirmed" : "idle"}
                  rerouteMessage={handler.id === "travel" ? undefined : "Prices follow the new handler."}
                  onQuantityChange={(id, quantity) =>
                    setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)))
                  }
                />
                <ConfirmCard
                  title="Hold this plan"
                  rows={rows}
                  checks={["Refundable until 1 May", "Names stay with you until you confirm"]}
                  actionLabel="Confirm hold"
                  state={phase === "confirmed" ? "confirmed" : "idle"}
                  rerouteMessage={
                    handler.id === "travel" ? undefined : `Rerouted from Travel to ${handler.name}. Review the new plan before you confirm.`
                  }
                  onConfirm={() => {
                    setPhase("confirmed");
                    setToast(true);
                  }}
                />
                {toast ? (
                  <Toast message="Confirmed" state="confirmed" onDismiss={() => setToast(false)} />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {variant === "hero" && (phase === "review" || phase === "confirmed") ? <div aria-hidden className="h-16" /> : null}
      </div>
      {variant === "full" ? (
        <form
          className="mt-6 flex items-center gap-2 border-t border-line pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <label htmlFor="goal" className="sr-only">
            Goal
          </label>
          <input
            id="goal"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Give the agent a goal"
            className="h-8 min-w-0 flex-1 rounded-[6px] border border-line bg-surface px-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button type="submit">Send</Button>
        </form>
      ) : null}
      {variant === "full" && phase === "ready" ? (
        <button
          type="button"
          className="mt-2 text-left text-[13px] leading-5 text-accent underline-offset-2 hover:underline"
          onClick={() => {
            setDraft(PROMPT);
            send(PROMPT);
          }}
        >
          {PROMPT}
        </button>
      ) : null}
    </div>
  );
}
