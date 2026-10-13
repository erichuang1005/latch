import { z } from "zod";

/** Latch catalog id. A string identifier, not a hosted file. */
export const LATCH_CATALOG_ID = "latch://catalog/v1";

export const A2UI_BASIC_CATALOG_V091 =
  "https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json";

export const A2UI_STANDARD_CATALOG_V08 =
  "https://a2ui.org/specification/v0_8/standard_catalog_definition.json";

export const latchStateSchema = z.enum([
  "idle",
  "loading",
  "needs-input",
  "confirmed",
  "error",
  "rerouted",
]);

export const summaryRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const choiceSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const handlerSchema = z.object({
  id: z.string(),
  name: z.string(),
  detail: z.string(),
});

export const confirmCardPropsSchema = z.object({
  title: z.string(),
  rows: z.array(summaryRowSchema).optional(),
  checks: z.array(z.string()).optional(),
  actionLabel: z.string().optional(),
  state: latchStateSchema.optional(),
  errorMessage: z.string().optional(),
  rerouteMessage: z.string().optional(),
  acknowledgement: z.string().optional(),
});

export const clarifyFormPropsSchema = z.object({
  question: z.string(),
  detail: z.string().optional(),
  choices: z.array(choiceSchema).optional(),
  allowCustom: z.boolean().optional(),
  customLabel: z.string().optional(),
  answerLabel: z.string().optional(),
  state: latchStateSchema.optional(),
  errorMessage: z.string().optional(),
  rerouteMessage: z.string().optional(),
});

export const handoffCardPropsSchema = z.object({
  handledBy: handlerSchema,
  alternatives: z.array(handlerSchema).optional(),
  original: handlerSchema.optional(),
  state: latchStateSchema.optional(),
  errorMessage: z.string().optional(),
});

export const thinkingStepsPropsSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      status: z.enum(["done", "current", "upcoming", "error"]).optional(),
    }),
  ),
  state: latchStateSchema.optional(),
});

export const choiceListPropsSchema = z.object({
  label: z.string(),
  options: z.array(choiceSchema),
  value: z.string().optional(),
  state: latchStateSchema.optional(),
  errorMessage: z.string().optional(),
  rerouteMessage: z.string().optional(),
});

export const itemSummaryPropsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      detail: z.string().optional(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
  currency: z.string().optional(),
  state: latchStateSchema.optional(),
  errorMessage: z.string().optional(),
  rerouteMessage: z.string().optional(),
});

export const statusPillPropsSchema = z.object({
  label: z.string(),
  tone: z.enum(["neutral", "success", "danger", "warning"]).optional(),
  state: latchStateSchema.optional(),
});

export const toastPropsSchema = statusPillPropsSchema.extend({
  message: z.string().optional(),
  open: z.boolean().optional(),
});

export const citationSourceSchema = z.object({
  title: z.string(),
  href: z.string().optional(),
  detail: z.string().optional(),
  quote: z.string().optional(),
});

export const citationPropsSchema = z
  .object({
    title: z.string().optional(),
    href: z.string().optional(),
    detail: z.string().optional(),
    quote: z.string().optional(),
    text: z.string().optional(),
    sources: z.array(citationSourceSchema).optional(),
    state: latchStateSchema.optional(),
  })
  .refine((value) => Boolean(value.title) || (value.sources && value.sources.length > 0), {
    message: "A citation needs a title or at least one source.",
  });

const sourceLineSchema = z.object({
  id: z.string(),
  text: z.string(),
  aside: z.string().optional(),
  speaker: z.string().optional(),
  time: z.string().optional(),
});

export const citedAnswerPropsSchema = z.object({
  text: z.string(),
  cites: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      documentId: z.string(),
      lineId: z.string(),
    }),
  ),
  documents: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      title: z.string(),
      meta: z.string(),
      lines: z.array(sourceLineSchema),
    }),
  ),
  state: latchStateSchema.optional(),
});

export const latchPropSchemas = {
  ConfirmCard: confirmCardPropsSchema,
  ClarifyForm: clarifyFormPropsSchema,
  HandoffCard: handoffCardPropsSchema,
  Reroute: handoffCardPropsSchema,
  ThinkingSteps: thinkingStepsPropsSchema,
  ChoiceList: choiceListPropsSchema,
  ItemSummary: itemSummaryPropsSchema,
  Cart: itemSummaryPropsSchema,
  StatusPill: statusPillPropsSchema,
  Toast: toastPropsSchema,
  Citation: citationPropsSchema,
  Source: citationPropsSchema,
  CitedAnswer: citedAnswerPropsSchema,
} as const;

export type LatchComponentType = keyof typeof latchPropSchemas;

export function validateLatchProps(type: string, props: unknown) {
  const schema = latchPropSchemas[type as LatchComponentType];
  if (!schema) return { success: true as const, data: props };
  return schema.safeParse(props);
}
