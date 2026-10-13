"use client";

import { useMemo, useState } from "react";
import { Citation } from "@/latch/components/citation";
import { Cite, SourceWorkspace, type SourceDocument } from "@/latch/components/source-workspace";
import { ChoiceList } from "@/latch/components/choice-list";
import { ClarifyForm, type ClarifyAnswer } from "@/latch/components/clarify-form";
import { ConfirmCard } from "@/latch/components/confirm-card";
import { HandoffCard } from "@/latch/components/handoff-card";
import { ItemSummary } from "@/latch/components/item-summary";
import { StatusPill, Toast } from "@/latch/components/status";
import { ThinkingSteps } from "@/latch/components/thinking-steps";
import { parseA2ui, resolveValue, type NormalizedComponent, type SurfaceModel } from "@/latch/adapter/parse";
import type { Handler, LatchAction, LatchState, SummaryItem } from "@/latch/types";
import { cn } from "@/lib/utils";

export type A2uiRendererProps = {
  input: string | unknown;
  onAction?: (action: LatchAction) => void;
  className?: string;
};

export function A2uiRenderer({ input, onAction, className }: A2uiRendererProps) {
  const parsed = useMemo(() => parseA2ui(input), [input]);
  const visible = parsed.surfaces.filter((surface) => surface.ready && !surface.deleted && surface.rootId && surface.components.has(surface.rootId));

  if (visible.length === 0) {
    return (
      <p className="text-[13px] leading-5 text-muted">
        {parsed.issues[0]?.message ?? "Nothing to render yet."}
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)} data-slot="a2ui-renderer">
      {visible.map((surface) => (
        <SurfaceView key={surface.id} surface={surface} onAction={onAction} />
      ))}
    </div>
  );
}

function SurfaceView({
  surface,
  onAction,
}: {
  surface: SurfaceModel;
  onAction?: (action: LatchAction) => void;
}) {
  const root = surface.components.get(surface.rootId as string);
  if (!root) return null;
  return (
    <div data-surface={surface.id}>
      {surface.theme?.agentDisplayName ? (
        <p className="mb-2 text-[12px] leading-4 text-muted">{surface.theme.agentDisplayName}</p>
      ) : null}
      <NodeView component={root} surface={surface} onAction={onAction} />
    </div>
  );
}

function NodeView({
  component,
  surface,
  onAction,
}: {
  component: NormalizedComponent;
  surface: SurfaceModel;
  onAction?: (action: LatchAction) => void;
}) {
  const props = resolveValue(component.props, surface.data) as Record<string, unknown>;
  const emit = (context?: Record<string, unknown>) => {
    if (!component.action) return;
    onAction?.({
      name: component.action.name,
      surfaceId: surface.id,
      sourceComponentId: component.id,
      context: { ...component.action.context, ...context },
    });
  };

  switch (component.type) {
    case "ConfirmCard":
      return <BoundConfirm props={props} onAction={emit} />;
    case "ClarifyForm":
      return <BoundClarify props={props} onAction={emit} />;
    case "HandoffCard":
    case "Reroute":
      return <BoundHandoff props={props} onAction={emit} />;
    case "ThinkingSteps":
      return <ThinkingSteps steps={asArray(props.steps)} state={asState(props.state)} />;
    case "ChoiceList":
      return <BoundChoice props={props} onAction={emit} />;
    case "ItemSummary":
    case "Cart":
      return <BoundSummary props={props} />;
    case "StatusPill":
      return <StatusPill tone={props.tone as "neutral"} state={asState(props.state)}>{String(props.label ?? "")}</StatusPill>;
    case "Toast":
      return <Toast message={String(props.message ?? props.label ?? "")} state={asState(props.state)} />;
    case "CitedAnswer":
      return <CitedAnswerView props={props} />;
    case "Citation":
    case "Source":
      return (
        <Citation
          title={typeof props.title === "string" ? props.title : undefined}
          href={typeof props.href === "string" ? props.href : undefined}
          detail={typeof props.detail === "string" ? props.detail : undefined}
          quote={typeof props.quote === "string" ? props.quote : undefined}
          text={typeof props.text === "string" ? props.text : undefined}
          sources={Array.isArray(props.sources) ? (props.sources as { title: string; href?: string; detail?: string; quote?: string }[]) : undefined}
          state={asState(props.state)}
        />
      );
    case "Text":
      return <TextView text={props.text} variant={(props.variant ?? props.usageHint) as string | undefined} />;
    case "Column":
      return (
        <div className="flex flex-col gap-2">
          {childIds(props.children).map((id) => (
            <Child key={id} id={id} surface={surface} onAction={onAction} />
          ))}
        </div>
      );
    case "Row":
      return (
        <div className="flex flex-wrap items-center gap-2">
          {childIds(props.children).map((id) => (
            <Child key={id} id={id} surface={surface} onAction={onAction} />
          ))}
        </div>
      );
    case "Card":
      return (
        <div className="rounded-[10px] border border-line bg-surface p-3">
          {typeof props.child === "string" ? <Child id={props.child} surface={surface} onAction={onAction} /> : null}
        </div>
      );
    case "Button":
      return (
        <button
          type="button"
          className="h-7 rounded-[6px] bg-ink px-2.5 text-[13px] font-medium text-surface"
          onClick={() => emit()}
        >
          {typeof props.child === "string" ? <Child id={props.child} surface={surface} onAction={onAction} plain /> : String(props.label ?? "Continue")}
        </button>
      );
    case "Divider":
      return <hr className="border-line" />;
    default:
      return <p className="text-[13px] leading-5 text-muted">Unsupported component: {component.type}</p>;
  }
}

function Child({
  id,
  surface,
  onAction,
  plain = false,
}: {
  id: string;
  surface: SurfaceModel;
  onAction?: (action: LatchAction) => void;
  plain?: boolean;
}) {
  const component = surface.components.get(id);
  if (!component) return <span className="text-[13px] text-muted">Missing {id}</span>;
  if (plain && component.type === "Text") {
    const props = resolveValue(component.props, surface.data) as Record<string, unknown>;
    return <>{String(props.text ?? "")}</>;
  }
  return <NodeView component={component} surface={surface} onAction={onAction} />;
}

function BoundConfirm({
  props,
  onAction,
}: {
  props: Record<string, unknown>;
  onAction: (context?: Record<string, unknown>) => void;
}) {
  const [state, setState] = useState<LatchState>(asState(props.state) ?? "idle");
  const [checked, setChecked] = useState(false);
  return (
    <ConfirmCard
      title={String(props.title ?? "Review")}
      rows={asRows(props.rows)}
      checks={asStrings(props.checks)}
      actionLabel={typeof props.actionLabel === "string" ? props.actionLabel : undefined}
      state={state}
      errorMessage={typeof props.errorMessage === "string" ? props.errorMessage : undefined}
      rerouteMessage={typeof props.rerouteMessage === "string" ? props.rerouteMessage : undefined}
      acknowledgement={typeof props.acknowledgement === "string" ? props.acknowledgement : undefined}
      acknowledgementChecked={checked}
      onAcknowledgementChange={setChecked}
      onConfirm={() => {
        setState("confirmed");
        onAction();
      }}
    />
  );
}

function BoundClarify({
  props,
  onAction,
}: {
  props: Record<string, unknown>;
  onAction: (context?: Record<string, unknown>) => void;
}) {
  const [answered, setAnswered] = useState<ClarifyAnswer | null>(null);
  const answerLabel = typeof props.answerLabel === "string" ? props.answerLabel : "Answer";
  return (
    <ClarifyForm
      question={String(props.question ?? "What is missing?")}
      detail={typeof props.detail === "string" ? props.detail : undefined}
      choices={asChoices(props.choices)}
      allowCustom={Boolean(props.allowCustom)}
      customLabel={typeof props.customLabel === "string" ? props.customLabel : undefined}
      answerLabel={answerLabel}
      state={answered ? "confirmed" : asState(props.state)}
      answered={answered}
      collapsed={Boolean(answered)}
      errorMessage={typeof props.errorMessage === "string" ? props.errorMessage : undefined}
      rerouteMessage={typeof props.rerouteMessage === "string" ? props.rerouteMessage : undefined}
      onSubmit={(answer) => {
        setAnswered({ label: answerLabel, value: answer.label });
        onAction({ value: answer.value, label: answer.label });
      }}
      onEdit={() => setAnswered(null)}
    />
  );
}

function BoundHandoff({
  props,
  onAction,
}: {
  props: Record<string, unknown>;
  onAction: (context?: Record<string, unknown>) => void;
}) {
  const initial = asHandler(props.handledBy) ?? { id: "agent", name: "Agent", detail: "Handling this request." };
  const original = asHandler(props.original) ?? initial;
  const [current, setCurrent] = useState(initial);
  return (
    <HandoffCard
      handledBy={current}
      original={original}
      alternatives={asHandlers(props.alternatives)}
      state={current.id !== original.id ? "rerouted" : asState(props.state)}
      errorMessage={typeof props.errorMessage === "string" ? props.errorMessage : undefined}
      onReroute={(next, log) => {
        setCurrent(next);
        if (log.from !== log.to) onAction({ handlerId: next.id, from: log.from, to: log.to, misroute: true });
      }}
    />
  );
}

function BoundChoice({
  props,
  onAction,
}: {
  props: Record<string, unknown>;
  onAction: (context?: Record<string, unknown>) => void;
}) {
  const [value, setValue] = useState(typeof props.value === "string" ? props.value : undefined);
  return (
    <ChoiceList
      label={String(props.label ?? "Choose")}
      options={asChoices(props.options)}
      value={value}
      state={asState(props.state)}
      errorMessage={typeof props.errorMessage === "string" ? props.errorMessage : undefined}
      rerouteMessage={typeof props.rerouteMessage === "string" ? props.rerouteMessage : undefined}
      onChange={(next) => {
        setValue(next);
        onAction({ value: next });
      }}
    />
  );
}

function BoundSummary({ props }: { props: Record<string, unknown> }) {
  const [items, setItems] = useState<SummaryItem[]>(asItems(props.items));
  return (
    <ItemSummary
      items={items}
      currency={typeof props.currency === "string" ? props.currency : undefined}
      state={asState(props.state)}
      errorMessage={typeof props.errorMessage === "string" ? props.errorMessage : undefined}
      rerouteMessage={typeof props.rerouteMessage === "string" ? props.rerouteMessage : undefined}
      onQuantityChange={(id, quantity) => setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)))}
    />
  );
}

function TextView({ text, variant }: { text: unknown; variant?: string }) {
  const content = String(text ?? "").replace(/^#{1,6}\s*/, "");
  const className =
    variant === "h1"
      ? "text-[24px] font-medium leading-8"
      : variant === "h2" || variant === "h3"
        ? "text-[15px] font-medium leading-5"
        : variant === "caption"
          ? "text-[12px] leading-4 text-muted"
          : "text-[13px] leading-5";
  if (variant === "h1") return <h1 className={className}>{content}</h1>;
  if (variant === "h2" || variant === "h3") return <h2 className={className}>{content}</h2>;
  return <p className={className}>{content}</p>;
}

function asState(value: unknown): LatchState | undefined {
  if (
    value === "idle" ||
    value === "loading" ||
    value === "needs-input" ||
    value === "confirmed" ||
    value === "error" ||
    value === "rerouted"
  ) {
    return value;
  }
  return undefined;
}

function asArray(value: unknown): [] {
  return Array.isArray(value) ? (value as []) : [];
}

function asStrings(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { label: unknown; value: unknown } => !!item && typeof item === "object")
    .map((item) => ({ label: String(item.label), value: String(item.value) }));
}

function asChoices(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { value: unknown; label: unknown; description?: unknown } => !!item && typeof item === "object")
    .map((item) => ({
      value: String(item.value),
      label: String(item.label),
      description: typeof item.description === "string" ? item.description : undefined,
    }));
}

function CitedAnswerView({ props }: { props: Record<string, unknown> }) {
  const documents = Array.isArray(props.documents) ? (props.documents as SourceDocument[]) : [];
  const cites = Array.isArray(props.cites)
    ? (props.cites as { id: string; label: string; documentId: string; lineId: string }[])
    : [];
  const first = cites[0];
  const text = String(props.text ?? "");
  const parts = text.split(/\{([^}]+)\}/);
  if (!first || documents.length === 0) return null;
  return (
    <SourceWorkspace
      documents={documents}
      initialDocument={first.documentId}
      initialLine={first.lineId}
      state={asState(props.state)}
      pane="embedded"
    >
      <p className="max-w-[62ch] text-[16px] leading-8">
        {parts.map((part, index) => {
          if (index % 2 === 0) return <span key={index}>{part}</span>;
          const cite = cites.find((item) => item.id === part);
          if (!cite) return <span key={index}>{part}</span>;
          return (
            <Cite key={cite.id} documentId={cite.documentId} lineId={cite.lineId} label={cite.label}>
              {cite.label}
            </Cite>
          );
        })}
      </p>
    </SourceWorkspace>
  );
}

function asHandler(value: unknown): Handler | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") return null;
  return { id: record.id, name: record.name, detail: typeof record.detail === "string" ? record.detail : "" };
}

function asHandlers(value: unknown) {
  return Array.isArray(value) ? value.map(asHandler).filter((item): item is Handler => !!item) : [];
}

function asItems(value: unknown): SummaryItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      id: String(item.id),
      name: String(item.name),
      detail: typeof item.detail === "string" ? item.detail : undefined,
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
    }));
}

function childIds(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}
