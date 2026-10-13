export type PropRow = {
  name: string;
  type: string;
  description: string;
};

export type ComponentDoc = {
  slug: string;
  name: string;
  principle: string;
  summary: string;
  states: string[];
  do: string[];
  dont: string[];
  props: PropRow[];
};

export const components: ComponentDoc[] = [
  {
    slug: "confirm-card",
    name: "ConfirmCard",
    principle: "A consequential action is a review, not a button.",
    summary: "Summary rows, included checks, and a compact trailing action. The confirmed state stays in the transcript.",
    states: ["idle", "loading", "needs-input", "confirmed", "error", "rerouted"],
    do: [
      "Show the facts that would change the decision.",
      "Keep the action a short verb, trailing and compact.",
      "Leave a confirmed state the person can still read.",
    ],
    dont: [
      "Ask a new question inside the card.",
      "Use it for something the agent can undo quietly.",
      "Hide the handler or the total.",
    ],
    props: [
      { name: "title", type: "string", description: "What the person is about to authorize." },
      { name: "rows", type: "SummaryRow[]", description: "Label and value pairs. Put the decision-changing facts here." },
      { name: "checks", type: "string[]", description: "Facts already true, shown as chips, not as tasks." },
      { name: "actionLabel", type: "string", description: "Short verb. Defaults to Confirm." },
      { name: "state", type: "LatchState", description: "idle, loading, needs-input, confirmed, error, or rerouted." },
      { name: "acknowledgement", type: "string", description: "Optional line the person must check before the action enables." },
      { name: "onConfirm", type: "() => void", description: "Fires when the person confirms." },
    ],
  },
  {
    slug: "clarify-form",
    name: "ClarifyForm",
    principle: "Ask only for the one fact that blocks the work, then collapse it.",
    summary: "One question, choice chips, and an optional field. After an answer, the form becomes a summary row.",
    states: ["needs-input", "loading", "confirmed", "error", "rerouted"],
    do: [
      "Ask the single fact the brief does not already contain.",
      "Collapse the question into the answer.",
      "Offer a few chips and room to type something else.",
    ],
    dont: [
      "Ask for city, date, and budget in one form.",
      "Leave the empty form sitting under the answer.",
      "Invent a choice the person did not make.",
    ],
    props: [
      { name: "question", type: "string", description: "The one missing fact, written as a question." },
      { name: "detail", type: "string", description: "Why this is the blocker, in one sentence." },
      { name: "choices", type: "Choice[]", description: "Short options. Not a menu of everything possible." },
      { name: "allowCustom", type: "boolean", description: "Shows an optional field beside the chips." },
      { name: "answered", type: "ClarifyAnswer | null", description: "When set with collapsed, the form becomes a row." },
      { name: "onSubmit", type: "(answer) => void", description: "The person's answer." },
    ],
  },
  {
    slug: "handoff",
    name: "HandoffCard",
    principle: "Name who is handling the request, and log a wrong handoff.",
    summary: "“Handled by” with a way to change it. Choosing someone else is recorded as a misroute.",
    states: ["idle", "loading", "needs-input", "confirmed", "error", "rerouted"],
    do: [
      "Name the handler in plain language.",
      "Let the person correct a wrong handoff.",
      "Write the correction down as a misroute.",
    ],
    dont: [
      "Switch agents with no trace.",
      "Ask the person to restate the goal.",
      "Hide the correction behind a settings page.",
    ],
    props: [
      { name: "handledBy", type: "Handler", description: "Who is handling it now." },
      { name: "original", type: "Handler", description: "Who it was first given to. Used for the misroute log." },
      { name: "alternatives", type: "Handler[]", description: "Other handlers the person can choose." },
      { name: "onReroute", type: "(next, log) => void", description: "Fires with from and to. Same name means they kept the original." },
    ],
  },
  {
    slug: "thinking-steps",
    name: "ThinkingSteps",
    principle: "Show the work as quiet prose. No card, no timer.",
    summary: "Gray inline steps joined by arrows. The current step is the only one that moves, and only if motion is allowed.",
    states: ["idle", "loading", "needs-input", "confirmed", "error", "rerouted"],
    do: [
      "Write steps as verbs, in the order the work happened.",
      "Keep them in the transcript, inline.",
      "Stop when the work stops.",
    ],
    dont: [
      "Put the steps in a card.",
      "Show a timer, a percentage, or a spinner.",
      "Narrate more steps than the work.",
    ],
    props: [
      { name: "steps", type: "ThinkingStep[]", description: "Each step has an id, a label, and an optional status." },
      { name: "state", type: "LatchState", description: "loading marks the work in progress. error colors the failed step." },
    ],
  },
  {
    slug: "choice-list",
    name: "ChoiceList",
    principle: "A decision is a list with one selected, not a wall of buttons.",
    summary: "Radio rows with a label and one line of detail. Arrow keys move the selection.",
    states: ["idle", "loading", "needs-input", "confirmed", "error", "rerouted"],
    do: [
      "Use it when the options need a line of explanation.",
      "Keep the current choice visible.",
      "Name the decision in the label.",
    ],
    dont: [
      "Use it for a yes or no that is really a confirm.",
      "Give every option a primary button.",
      "Hide the description the choice depends on.",
    ],
    props: [
      { name: "label", type: "string", description: "What the person is choosing." },
      { name: "options", type: "Choice[]", description: "Value, label, and an optional description." },
      { name: "value", type: "string", description: "The selected value." },
      { name: "onChange", type: "(value) => void", description: "Fires when the selection changes." },
    ],
  },
  {
    slug: "item-summary",
    name: "ItemSummary",
    principle: "Quantity and money stay visible and editable until confirm.",
    summary: "Rows, a quantity stepper, and a subtotal. Also exported as the Cart alias in A2UI messages.",
    states: ["idle", "loading", "needs-input", "confirmed", "error", "rerouted"],
    do: [
      "Keep quantity editable until the person confirms.",
      "Show the subtotal in the same surface.",
      "Leave a removed line visible, at zero.",
    ],
    dont: [
      "Lock the plan before it has been reviewed.",
      "Round away a number the person needs.",
      "Start a second checkout somewhere else on the page.",
    ],
    props: [
      { name: "items", type: "SummaryItem[]", description: "Name, detail, quantity, and unit price." },
      { name: "currency", type: "string", description: "ISO currency. Defaults to EUR." },
      { name: "onQuantityChange", type: "(id, quantity) => void", description: "Stepper callback. Zero removes the line from the subtotal." },
    ],
  },
  {
    slug: "status",
    name: "StatusPill",
    principle: "A status is a short sentence, not a color.",
    summary: "Inline pills such as Added and Confirmed, and a toast that can be dismissed.",
    states: ["idle", "loading", "confirmed", "error", "rerouted"],
    do: [
      "Use a short past-tense word: Added, Confirmed.",
      "Put the toast next to the action that caused it.",
      "Let the person dismiss it.",
    ],
    dont: [
      "Toast every internal step.",
      "Rely on color alone.",
      "Block the transcript with a banner.",
    ],
    props: [
      { name: "children", type: "ReactNode", description: "The status words." },
      { name: "tone", type: "neutral | success | danger | warning", description: "Color is secondary to the words." },
      { name: "message", type: "string", description: "Toast only. The same words as the pill." },
      { name: "onDismiss", type: "() => void", description: "Toast only." },
    ],
  },
  {
    slug: "citation",
    name: "Citation",
    principle: "A figure in the sentence opens the file it came from, on the line that supports it.",
    summary: "The pill is the number or the clause in the answer. Hover previews that page. Click opens the contract, invoice, policy, or thread, scrolled to the line.",
    states: ["idle", "loading", "needs-input", "confirmed", "error", "rerouted"],
    do: [
      "Make the figure itself the pill, inside the sentence.",
      "Preview the page on hover. Open the file on click and highlight the line.",
      "Scroll when the line changes. Swap the stack when the file changes. Close puts the files away.",
    ],
    dont: [
      "Replace the file with a hostname and a one-line blurb.",
      "Cite a line the answer did not use.",
      "Close the file when the pointer leaves the pill.",
    ],
    props: [
      { name: "documentId", type: "string", description: "Which file the figure comes from." },
      { name: "lineId", type: "string", description: "The line to scroll to and highlight." },
      { name: "label", type: "string", description: "The figure as it appears in the sentence." },
      { name: "documents", type: "SourceDocument[]", description: "The files the answer is allowed to open." },
    ],
  },
];

export function getComponent(slug: string) {
  return components.find((item) => item.slug === slug);
}

export const nav = [
  { href: "/", label: "Overview" },
  { href: "/components/citation", label: "Citation" },
  { href: "/demo", label: "Demo" },
  { href: "/principles", label: "Principles" },
  { href: "/research", label: "Research" },
];
