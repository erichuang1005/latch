import { LATCH_CATALOG_ID } from "@/latch/adapter/schema";

const travel = { id: "travel", name: "Travel", detail: "Flights, rooms, and the group hold." };
const events = { id: "events", name: "Events", detail: "Venue, agenda, and the day-of plan." };

export const confirmCardMessages = [
  {
    version: "v0.9.1",
    createSurface: {
      surfaceId: "hold",
      catalogId: LATCH_CATALOG_ID,
      theme: { agentDisplayName: "Travel" },
    },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "hold",
      components: [
        {
          id: "root",
          component: "ConfirmCard",
          title: "Hold the Lisbon rooms",
          rows: [
            { label: "Where", value: "Lisbon" },
            { label: "When", value: "12–16 May" },
            { label: "People", value: "12" },
            { label: "Plan", value: "€9,420" },
          ],
          checks: ["Refundable until 1 May", "Names stay with you until you confirm"],
          actionLabel: "Confirm hold",
          state: "idle",
          action: { event: { name: "confirm_hold" } },
        },
      ],
    },
  },
];

export const clarifyMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "budget", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "budget",
      components: [
        {
          id: "root",
          component: "ClarifyForm",
          question: "What budget should this stay under?",
          detail: "City, month, and headcount are already in the brief.",
          answerLabel: "Budget",
          allowCustom: true,
          customLabel: "Other amount",
          choices: [
            { value: "8000", label: "€8,000" },
            { value: "15000", label: "€15,000" },
            { value: "25000", label: "€25,000" },
          ],
          state: "needs-input",
          action: { event: { name: "answer_budget" } },
        },
      ],
    },
  },
];

export const handoffMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "handler", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "handler",
      components: [
        {
          id: "root",
          component: "HandoffCard",
          handledBy: travel,
          original: travel,
          alternatives: [events],
          state: "idle",
          action: { event: { name: "reroute" } },
        },
      ],
    },
  },
];

export const thinkingMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "work", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "work",
      components: [
        {
          id: "root",
          component: "ThinkingSteps",
          state: "loading",
          steps: [
            { id: "brief", label: "Reading the brief", status: "done" },
            { id: "facts", label: "Using 12 people, Lisbon, May", status: "done" },
            { id: "gap", label: "One fact missing: budget", status: "current" },
          ],
        },
      ],
    },
  },
];

export const choiceMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "laptop", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "laptop",
      components: [
        {
          id: "root",
          component: "ChoiceList",
          label: "Which machine should the request cover?",
          value: "standard",
          options: [
            { value: "standard", label: "Standard laptop", description: "Enough for documents and calls." },
            { value: "design", label: "Design laptop", description: "More memory for large files." },
          ],
          state: "idle",
        },
      ],
    },
  },
];

export const summaryMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "plan", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateDataModel: {
      surfaceId: "plan",
      path: "/dinner",
      value: 55,
    },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "plan",
      components: [
        {
          id: "root",
          component: "ItemSummary",
          currency: "EUR",
          items: [
            { id: "flights", name: "Group fare to Lisbon", detail: "Per seat", quantity: 12, unitPrice: 310 },
            { id: "rooms", name: "Rooms in Alfama", detail: "Per room, 4 nights", quantity: 6, unitPrice: 840 },
            {
              id: "dinner",
              name: "Group dinner",
              detail: "Per person",
              quantity: 12,
              unitPrice: { path: "/dinner" },
            },
          ],
        },
      ],
    },
  },
];

export const citationMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "source", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "source",
      components: [
        {
          id: "root",
          component: "CitedAnswer",
          text: "The renewal sits under the {cap} second-approval line.",
          cites: [{ id: "cap", label: "€25,000", documentId: "policy", lineId: "cap" }],
          documents: [
            {
              id: "policy",
              kind: "Policy",
              title: "Approval policy POL-14",
              meta: "Finance · sample file",
              lines: [
                { id: "before", text: "3. Between €10,000 and €25,000, finance is copied." },
                { id: "cap", text: "A commitment above €25,000 needs a second approver before it is signed." },
                { id: "after", text: "5. A renewal uses the same line as a new commitment." },
              ],
            },
          ],
        },
      ],
    },
  },
];

export const statusMessages = [
  {
    version: "v0.9.1",
    createSurface: { surfaceId: "status", catalogId: LATCH_CATALOG_ID },
  },
  {
    version: "v0.9.1",
    updateComponents: {
      surfaceId: "status",
      components: [
        { id: "root", component: "Row", children: ["added", "confirmed"] },
        { id: "added", component: "StatusPill", label: "Added", tone: "neutral" },
        { id: "confirmed", component: "StatusPill", label: "Confirmed", tone: "success", state: "confirmed" },
      ],
    },
  },
];

/** v0.8 adjacency-list sample, kept so older streams still render. */
export const legacyTextJsonl = [
  '{"surfaceUpdate":{"surfaceId":"main","components":[{"id":"root","component":{"Text":{"text":{"literalString":"Hello from v0.8"},"usageHint":"h3"}}}]}}',
  '{"beginRendering":{"surfaceId":"main","root":"root","catalogId":"https://a2ui.org/specification/v0_8/standard_catalog_definition.json"}}',
].join("\n");

export function messagesToJson(messages: unknown[]) {
  return JSON.stringify(messages, null, 2);
}
