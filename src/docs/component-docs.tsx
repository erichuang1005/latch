"use client";

import { useState } from "react";
import { A2uiRenderer } from "@/latch/adapter/renderer";
import {
  choiceMessages,
  citationMessages,
  clarifyMessages,
  confirmCardMessages,
  handoffMessages,
  messagesToJson,
  statusMessages,
  summaryMessages,
  thinkingMessages,
} from "@/latch/adapter/examples";
import { components, type ComponentDoc } from "@/docs/content";
import { ComponentPreview } from "@/docs/previews";
import type { LatchState } from "@/latch/types";
import { cn } from "@/lib/utils";

const jsonFor: Record<string, unknown[]> = {
  "confirm-card": confirmCardMessages,
  "clarify-form": clarifyMessages,
  handoff: handoffMessages,
  "thinking-steps": thinkingMessages,
  "choice-list": choiceMessages,
  "item-summary": summaryMessages,
  status: statusMessages,
  citation: citationMessages,
};

const labels: Record<string, string> = {
  idle: "Idle",
  loading: "Loading",
  "needs-input": "Needs input",
  confirmed: "Confirmed",
  error: "Error",
  rerouted: "Rerouted",
};

export function ComponentDocs({ slug }: { slug: string }) {
  const doc = components.find((item) => item.slug === slug) as ComponentDoc;
  const [state, setState] = useState<LatchState>((doc.states[0] as LatchState) ?? "idle");
  const json = messagesToJson(jsonFor[slug] ?? []);

  return (
    <article>
      <p className="text-[13px] leading-5 text-muted">Component</p>
      <h1 className="mt-1 text-[32px] font-medium leading-[1.15] tracking-[-0.03em]">{doc.name}</h1>
      <p className="mt-3 max-w-[62ch] text-[16px] leading-7">{doc.principle}</p>
      <p className="mt-2 max-w-[62ch] text-[15px] leading-6 text-muted">{doc.summary}</p>

      <div role="tablist" aria-label="State" className="mt-8 flex flex-wrap gap-x-4 gap-y-2">
        {doc.states.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={state === item}
            onClick={() => setState(item as LatchState)}
            className={cn(
              "text-[13px] leading-5 outline-none focus-visible:ring-2 focus-visible:ring-accent",
              state === item ? "font-medium text-ink underline decoration-ink underline-offset-4" : "text-muted hover:text-ink",
            )}
          >
            {labels[item] ?? item}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-[14px] border border-line px-4 py-6 sm:px-8">
        <ComponentPreview key={state} slug={slug} state={state} />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="text-[13px] font-medium leading-5">Do</h2>
          <ul className="mt-2 space-y-2">
            {doc.do.map((item) => (
              <li key={item} className="text-[14px] leading-6 text-muted">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-[13px] font-medium leading-5">Don&apos;t</h2>
          <ul className="mt-2 space-y-2">
            {doc.dont.map((item) => (
              <li key={item} className="text-[14px] leading-6 text-muted">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <h2 className="mb-3 mt-12 text-[20px] font-medium tracking-[-0.02em]">Props</h2>
      <div tabIndex={0} aria-label="Props" className="max-w-full overflow-x-auto border-t border-line">
        <table className="w-full min-w-[560px] text-left text-[13px] leading-5">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 pr-4 font-medium">Prop</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {doc.props.map((prop) => (
              <tr key={prop.name} className="border-b border-line align-top">
                <td className="py-2 pr-4 font-mono text-[12px]">{prop.name}</td>
                <td className="py-2 pr-4 font-mono text-[12px] text-muted">{prop.type}</td>
                <td className="py-2 text-muted">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-12 text-[20px] font-medium tracking-[-0.02em]">A2UI message</h2>
      <p className="max-w-[62ch] text-[14px] leading-6 text-muted">
        v0.9.1 envelope. <span className="font-mono text-[12px]">catalogId</span> is{" "}
        <span className="font-mono text-[12px]">latch://catalog/v1</span>. The preview under the message is rendered by the adapter, not hand-built.
      </p>
      <CodeBlock code={json} />
      <div className="mt-4 rounded-[14px] border border-line px-4 py-6 sm:px-8">
        <A2uiRenderer input={jsonFor[slug]} />
      </div>
    </article>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 overflow-hidden rounded-[10px] border border-line">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <p className="text-[12px] text-muted">JSON</p>
        <button
          type="button"
          className="text-[12px] text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre tabIndex={0} aria-label="A2UI JSON" className="max-w-full overflow-x-auto p-3 text-[12px] leading-5">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function StatesGallery() {
  return (
    <article>
      <p className="text-[13px] leading-5 text-muted">Catalog</p>
      <h1 className="mt-1 text-[32px] font-medium leading-[1.15] tracking-[-0.03em]">All states</h1>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-6 text-muted">
        Every component in the states it actually has. Loading is a sentence. Confirmed stays on the page. A wrong handoff is logged.
      </p>
      <div className="mt-10 space-y-12">
        {components.map((doc) => (
          <section key={doc.slug} id={doc.slug} className="border-t border-line pt-6">
            <h2 className="text-[20px] font-medium tracking-[-0.02em]">{doc.name}</h2>
            <p className="mt-1 max-w-[62ch] text-[14px] leading-6 text-muted">{doc.principle}</p>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              {doc.states.map((state) => (
                <figure key={state}>
                  <figcaption className="mb-2 text-[12px] leading-4 text-muted">{labels[state] ?? state}</figcaption>
                  <ComponentPreview slug={doc.slug} state={state as LatchState} />
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
