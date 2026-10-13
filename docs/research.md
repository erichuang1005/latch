# Research

Latch is an A2UI catalog for a narrow part of an agent’s behavior: ask only when a fact is actually missing, name who is handling the request, and have a person confirm before anything consequential. The notes below are the comparison that led to that scope. Examples in the library stay fictional (travel, a software request, an event). Nothing here is drawn from an employer product.

Checked against the public docs on 9 October 2026.

## What each project is

**A2UI** is a protocol, not a React kit. An agent streams declarative JSONL. The client renders it with widgets from a catalog both sides have agreed on. v0.9.1 is the current production release. v0.8 is legacy. The basic catalog covers text, layout, inputs, buttons, modals, and choice pickers. A custom catalog is a first-class idea: `catalogId` is an identifier, not a file the client has to download.

**Vercel AI SDK** is the streaming and tool-calling layer (`useChat`, tool parts, `needsApproval`). **AI Elements** is a shadcn-style registry: you copy Conversation, Message, Reasoning, Sources, Confirmation, and the rest into your repo. Confirmation is wired to the SDK’s approval states. Sources renders `source-url` parts. Reasoning and Chain of Thought render the model’s thinking, often with a duration.

**CopilotKit** is an agent runtime. Generative UI is a `render` prop. `useHumanInTheLoop` pauses the run until `respond` is called. Shared state and AG-UI are the point, not a fixed catalog of review components.

**assistant-ui** is headless chat on Radix/shadcn primitives (Thread, Message, Composer) with runtimes for the AI SDK and others. Its Approval card is a human-in-the-loop gate, including allow-once / always-allow / deny, and it can describe a shell command or a plain action.

**OpenAI Apps SDK** (plugins) puts optional UI inside ChatGPT. The UI is a sandboxed MCP resource. The host owns the frame. There is no portable catalog of confirm, clarify, or handoff components.

**Thesys C1** is a generative UI API. You send a prompt to an OpenAI-compatible endpoint and render what comes back with their React SDK. The model chooses the components. You theme them. You do not publish the catalog.

## Comparison

| | What it is | Confirm before acting | Ask only when something is missing | Reroute / misroute | Who is handling it | Citations | Do you own the catalog? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A2UI | Protocol. JSONL in, native widgets out. | Button, Modal, CheckBox. Nothing that reviews facts and then stays confirmed. | TextField, ChoicePicker. Nothing that asks one question and collapses. | Not in the basic catalog. | `agentDisplayName` and `iconUrl` on the surface theme. Attribution, not a correction. | No source chip. | Yes. That is the design. |
| AI SDK + AI Elements | Streaming hooks, plus React you copy in. | `Confirmation`, bound to tool approval. Approve or deny. | You build the question. | No. | No handler. | `Sources`, from message parts. | You own the files. It is not an A2UI catalog. |
| CopilotKit | Agent runtime and generative UI. | `useHumanInTheLoop`. The pause is real. The UI is yours. | The tool you register. | Whatever the app codes. | The copilot chrome. | Whatever you render. | You own the render function. |
| assistant-ui | Headless chat primitives. | Approval card. Often allow once, always, or deny. | You build the question. | No. | The assistant message. | Varies by app. | You compose the primitives. |
| OpenAI Apps SDK | Optional UI inside ChatGPT, sandboxed. | The host, plus your widget. | Your widget. | No standard misroute. | The plugin. | No standard chip. | A widget in their frame. |
| Thesys C1 | Generative UI API. The model streams components. | Forms and actions the model emits. | The model decides what to ask. | No misroute log. | No correctable handler. | No. | Their set, themed. |
| Latch | An A2UI catalog for the judgment around an action. | ConfirmCard. Rows, checks, a confirmed state that stays. | ClarifyForm. One question, then a summary row. | HandoffCard writes a misroute. | Named handler, with a way to change it. | Citation on the claim. | `latch://catalog/v1`. |

## The gap, stated carefully

These are not empty categories elsewhere:

- A2UI v0.9.1 already tells the client which agent created a surface (`theme.agentDisplayName`, `theme.iconUrl`). The orchestrator is expected to set that so a sub-agent cannot impersonate another. That is attribution. It is not a control that says “not right? change,” and it does not record the correction as a misroute.
- AI Elements Confirmation and assistant-ui’s Approval card already pause a tool. They are approve/deny (or allow-once / always / deny) around an action the model already chose. They are not a review of the facts the person needs, and they do not stay in the transcript as a confirmed record with the rows still readable.
- AI Elements inline citation opens a card with a hostname and a short description. Latch opens the file the figure came from, scrolled to that line: a clause, an invoice row, a policy line, or a thread message.
- AI Elements Reasoning often surfaces how long the model thought. Latch’s thinking line is plain text with arrows, and it has no timer. A timer makes the wait the subject. The work should be the subject.

What none of the catalogs ship as addressable components:

1. **Misroute handling.** A wrong handler is a logged correction (`Travel → Events`), not a silent swap and not only a theme string.
2. **Clarify only when a fact is missing.** One question, chips plus an optional field, then the question collapses into the answer. The agent does not re-ask for facts the brief already has.
3. **Confirm as a review, with an after state.** The rows that would change a decision, the checks that are already true, a compact trailing verb, and a confirmed state that remains.
4. **A handler a person can correct.** “Handled by X,” with the alternatives in the same surface.
5. **A citation bound to a claim.** A chip, not a bibliography.

Latch does not replace the basic A2UI catalog. Text, rows, buttons, and fields still belong there. Latch is the catalog you add when the agent is about to do something that costs money, time, or trust.

## What Latch is not

- Not a chat framework, a thread store, or a model gateway.
- Not an implementation of the whole basic catalog. The adapter renders Text, Row, Column, Card, Button, and Divider well enough to host a Latch component, and it reports anything else as unsupported.
- Not a claim that approval, sources, or agent names were unsolved. The missing piece is the combination, in a catalog an agent can name.

## Sources

- [A2UI](https://a2ui.org/)
- [Protocol v0.9.1 (current)](https://a2ui.org/specification/v0.9.1-a2ui/)
- [Protocol v0.8 (legacy)](https://a2ui.org/specification/v0.8-a2ui/)
- [Component gallery](https://a2ui.org/reference/components/)
- [Message reference](https://a2ui.org/reference/messages/)
- [google/A2UI](https://github.com/google/A2UI)
- [Basic catalog id used by the v0.9.1 spec](https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json)
- [AI Elements](https://elements.ai-sdk.dev/)
- [Confirmation](https://elements.ai-sdk.dev/components/confirmation)
- [Sources](https://elements.ai-sdk.dev/components/sources)
- [Reasoning](https://elements.ai-sdk.dev/components/reasoning)
- [Chain of Thought](https://elements.ai-sdk.dev/components/chain-of-thought)
- [AI SDK human-in-the-loop](https://ai-sdk.dev/cookbook/next/human-in-the-loop)
- [CopilotKit human-in-the-loop](https://docs.copilotkit.ai/human-in-the-loop)
- [useHumanInTheLoop](https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop)
- [assistant-ui](https://www.assistant-ui.com/)
- [Approval card](https://www.assistant-ui.com/elements/approval-card)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [Thesys C1](https://docs.thesys.dev/guides/what-is-thesys-c1)
