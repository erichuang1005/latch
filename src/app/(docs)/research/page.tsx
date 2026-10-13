import type { Metadata } from "next";

export const metadata: Metadata = { title: "Research" };

const rows = [
  ["A2UI", "Protocol. The client renders an agreed catalog from JSONL.", "Button, Modal, CheckBox. No review that stays confirmed.", "TextField and ChoicePicker. No single missing fact that collapses.", "Not in the basic catalog.", "agentDisplayName on the surface theme. Attribution, not a correction.", "No source chip.", "Yes. Custom catalogs are the point."],
  ["AI SDK + AI Elements", "Streaming hooks, plus React you copy into the repo.", "Confirmation, tied to tool approval. Approve or deny.", "You build the question.", "No.", "No handler.", "Sources, from message parts.", "You own the files. Not an A2UI catalog."],
  ["CopilotKit", "Agent runtime and generative UI over AG-UI.", "useHumanInTheLoop pauses on a render you write.", "The tool you register.", "Whatever the app does.", "Copilot chrome.", "Whatever you render.", "You own the render function."],
  ["assistant-ui", "Headless chat primitives on shadcn.", "ApprovalCard. Often allow once, always, or deny.", "You build the question.", "No.", "The assistant message.", "Varies.", "You compose the primitives."],
  ["OpenAI Apps SDK", "Optional UI inside ChatGPT, sandboxed over MCP.", "The host, plus your widget.", "Your widget.", "No standard misroute.", "The plugin.", "No standard chip.", "A sandboxed widget, not your system."],
  ["Thesys C1", "A generative UI API. The model streams components.", "Forms and actions the model emits.", "The model decides what to ask.", "No misroute log.", "No named, correctable handler.", "No.", "Their set, themed."],
  ["Latch", "An A2UI catalog for the judgment around an action.", "ConfirmCard. Facts, checks, a confirmed state.", "ClarifyForm. One question, then a row.", "HandoffCard logs a misroute.", "Named handler, and a way to change it.", "Citation on the claim.", "latch://catalog/v1"],
];

const heads = ["Project", "What it is", "Confirm", "Ask once", "Misroute", "Handler", "Citation", "Catalog"];

export default function ResearchPage() {
  return (
    <article>
      <p className="text-[13px] leading-5 text-muted">Notes</p>
      <h1 className="mt-1 text-[32px] font-medium leading-[1.15] tracking-[-0.03em]">Research</h1>
      <p className="mt-3 max-w-[62ch] text-[16px] leading-7">
        The open catalogs can draw a button. They do not yet treat “ask only when something is missing, name the handler, and confirm before acting” as components. That is the gap Latch fills.
      </p>
      <p className="mt-3 max-w-[62ch] text-[14px] leading-6 text-muted">
        A2UI v0.9.1 already puts <span className="font-mono text-[12px]">agentDisplayName</span> on a surface. AI Elements already has Confirmation and Sources. assistant-ui already has an approval card. Latch is not a claim that those screens do not exist. It is the combination, as a catalog an agent can address.
      </p>

      <div tabIndex={0} aria-label="Comparison" className="mt-8 max-w-full overflow-x-auto border-t border-line">
        <table className="w-full min-w-[880px] text-left text-[13px] leading-5">
          <thead>
            <tr className="border-b border-line text-muted">
              {heads.map((head) => (
                <th key={head} className="py-2 pr-4 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-line align-top">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className={index === 0 ? "py-3 pr-4 font-medium text-ink" : "py-3 pr-4 text-muted"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-12 text-[20px] font-medium tracking-[-0.02em]">What this catalog adds</h2>
      <ol className="max-w-[62ch] list-decimal space-y-3 pl-5 text-[15px] leading-6 text-muted">
        <li>A wrong handoff is a logged misroute, not a silent swap.</li>
        <li>A clarify asks one missing fact and then gets out of the way.</li>
        <li>A confirm is a review of the facts, with a state after the person agrees.</li>
        <li>The handler is named, and the person can correct it.</li>
        <li>A citation is the figure in the sentence. It opens the file and highlights the line.</li>
      </ol>

      <h2 className="mb-3 mt-12 text-[20px] font-medium tracking-[-0.02em]">Sources</h2>
      <ul className="max-w-[62ch] space-y-2 text-[14px] leading-6">
        {[
          ["https://a2ui.org/", "A2UI"],
          ["https://a2ui.org/specification/v0.9.1-a2ui/", "A2UI protocol v0.9.1"],
          ["https://a2ui.org/specification/v0.8-a2ui/", "A2UI protocol v0.8"],
          ["https://a2ui.org/reference/components/", "A2UI component gallery"],
          ["https://a2ui.org/reference/messages/", "A2UI message reference"],
          ["https://github.com/google/A2UI", "google/A2UI"],
          ["https://elements.ai-sdk.dev/", "AI Elements"],
          ["https://elements.ai-sdk.dev/components/confirmation", "AI Elements Confirmation"],
          ["https://elements.ai-sdk.dev/components/sources", "AI Elements Sources"],
          ["https://elements.ai-sdk.dev/components/reasoning", "AI Elements Reasoning"],
          ["https://ai-sdk.dev/cookbook/next/human-in-the-loop", "AI SDK human-in-the-loop"],
          ["https://docs.copilotkit.ai/human-in-the-loop", "CopilotKit human-in-the-loop"],
          ["https://www.assistant-ui.com/elements/approval-card", "assistant-ui Approval card"],
          ["https://www.assistant-ui.com/", "assistant-ui"],
          ["https://developers.openai.com/apps-sdk", "OpenAI Apps SDK"],
          ["https://docs.thesys.dev/guides/what-is-thesys-c1", "Thesys C1"],
        ].map(([href, label]) => (
          <li key={href}>
            <a href={href} className="text-ink underline decoration-line underline-offset-4">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-[62ch] text-[13px] leading-5 text-muted">
        The longer note, with the same table, is in docs/research.md in the repository.
      </p>
    </article>
  );
}
