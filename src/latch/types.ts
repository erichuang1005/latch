export const LATCH_STATES = [
  "idle",
  "loading",
  "needs-input",
  "confirmed",
  "error",
  "rerouted",
] as const;

export type LatchState = (typeof LATCH_STATES)[number];

export type SummaryRow = {
  label: string;
  value: string;
};

export type Choice = {
  value: string;
  label: string;
  description?: string;
};

export type Handler = {
  id: string;
  name: string;
  detail: string;
};

export type ThinkingStep = {
  id: string;
  label: string;
  status?: "done" | "current" | "upcoming" | "error";
};

export type SummaryItem = {
  id: string;
  name: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
};

export type LatchAction = {
  name: string;
  surfaceId: string;
  sourceComponentId: string;
  context?: Record<string, unknown>;
};

export type MisrouteLog = {
  from: string;
  to: string;
};
