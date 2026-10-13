"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RenewalAnswer } from "@/docs/cited-passage";
import { sampleDocuments } from "@/docs/sample-sources";
import { Cite, SourceWorkspace } from "@/latch/components/source-workspace";
import { cn } from "@/lib/utils";

const threads = [
  { id: "renewal", title: "Northwind renewal", detail: "Five files, one figure each" },
  { id: "lisbon", title: "Lisbon rooms", detail: "No files pinned" },
] as const;

type ThreadId = (typeof threads)[number]["id"];

export function RenewalChat() {
  return (
    <SourceWorkspace documents={sampleDocuments} initialDocument="policy" initialLine="cap" className="lg:h-full">
      <ChatShell />
    </SourceWorkspace>
  );
}

function ChatShell() {
  const [thread, setThread] = useState<ThreadId>("renewal");
  const [draft, setDraft] = useState("");
  const [followUps, setFollowUps] = useState<Record<ThreadId, string[]>>({ renewal: [], lisbon: [] });
  const scroller = useRef<HTMLDivElement>(null);
  const active = threads.find((item) => item.id === thread) ?? threads[0];

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTo?.({ top: node.scrollHeight });
  }, [thread, followUps]);

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setFollowUps((current) => ({ ...current, [thread]: [...current[thread], text] }));
    setDraft("");
  }

  return (
    <div className="flex min-h-[640px] flex-col lg:h-full lg:min-h-0 lg:flex-row">
      <nav aria-label="Threads" className="hidden w-[200px] shrink-0 flex-col gap-1 border-r border-line p-3 md:flex">
        <p className="px-2 pb-1 text-[12px] leading-4 text-muted">Threads</p>
        {threads.map((item) => (
          <ThreadButton key={item.id} item={item} current={item.id === thread} onSelect={() => setThread(item.id)} />
        ))}
      </nav>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-labelledby="thread-title">
        <header className="shrink-0 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex gap-2 overflow-x-auto md:hidden">
            {threads.map((item) => (
              <ThreadButton key={item.id} item={item} current={item.id === thread} onSelect={() => setThread(item.id)} compact />
            ))}
          </div>
          <h1 id="thread-title" className="mt-3 text-[16px] font-medium leading-6 tracking-[-0.02em] md:mt-0">
            {active.title}
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-muted">Hover a figure to preview the page. Click it to open the file.</p>
        </header>
        <div ref={scroller} tabIndex={0} aria-label="Messages" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-5">
          {thread === "renewal" ? <RenewalThread /> : <LisbonThread />}
          {followUps[thread].map((text, index) => (
            <div key={`${thread}-${index}`} className="space-y-5">
              <UserMessage>{text}</UserMessage>
              <AssistantMessage>
                {thread === "renewal" ? <FollowUp /> : <p>That question is not in a file on this thread.</p>}
              </AssistantMessage>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <Input id="message" name="message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about these files" />
          <Button type="submit" disabled={draft.trim().length === 0}>
            Send
          </Button>
        </form>
      </section>
    </div>
  );
}

function ThreadButton({
  item,
  current,
  onSelect,
  compact = false,
}: {
  item: (typeof threads)[number];
  current: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={current ? "true" : undefined}
      onClick={onSelect}
      className={cn(
        "rounded-[8px] text-left outline-none focus-visible:ring-2 focus-visible:ring-accent",
        compact ? "shrink-0 border px-2.5 py-1" : "px-2 py-1.5",
        current ? "bg-surface text-ink" : "text-muted hover:text-ink",
        compact && (current ? "border-line-strong" : "border-line"),
      )}
    >
      <span className="block text-[13px] font-medium leading-5">{item.title}</span>
      {compact ? null : <span className="block text-[12px] leading-4 text-faint">{item.detail}</span>}
    </button>
  );
}

function RenewalThread() {
  return (
    <>
      <UserMessage>Can we renew Northwind without a second approver? The invoice is INV-2041.</UserMessage>
      <AssistantMessage>
        <RenewalAnswer detailed className="max-w-none text-[15px] leading-7" />
      </AssistantMessage>
    </>
  );
}

function LisbonThread() {
  return (
    <>
      <UserMessage>Hold two rooms in Lisbon for Thursday.</UserMessage>
      <AssistantMessage>
        <p>No file is pinned to this thread, so there is nothing to cite. The renewal thread has the policy, the agreement, and the invoice.</p>
      </AssistantMessage>
    </>
  );
}

function FollowUp() {
  return (
    <p>
      Notice stays in the agreement: <Cite documentId="agreement" lineId="notice" label="30 days">30 days</Cite>. The second-approval line is still{" "}
      <Cite documentId="policy" lineId="cap" label="€25,000">€25,000</Cite>.
    </p>
  );
}

function UserMessage({ children }: { children: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[46ch] rounded-[14px] border border-line bg-surface px-3 py-2 text-[15px] leading-6">{children}</p>
    </div>
  );
}

function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[68ch]">
      <p className="text-[12px] leading-4 text-muted">Latch</p>
      <div className="mt-1 text-[15px] leading-7">{children}</div>
    </div>
  );
}
