import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/docs/content";

export const metadata: Metadata = { title: "Principles" };

const spacing = [4, 8, 12, 16, 24, 32, 48, 64];

export default function PrinciplesPage() {
  return (
    <article>
      <p className="text-[13px] leading-5 text-muted">Design</p>
      <h1 className="mt-1 text-[32px] font-medium leading-[1.15] tracking-[-0.03em]">Principles</h1>
      <p className="mt-3 max-w-[62ch] text-[16px] leading-7">
        Light first. One accent. Four-pixel spacing. Components sit in a transcript, so they should read like sentences with a decision in them.
      </p>

      <h2 className="mb-3 mt-12 text-[20px] font-medium tracking-[-0.02em]">Tokens</h2>
      <section className="max-w-[680px]">
        <h3 className="text-[13px] leading-5 text-muted">Spacing</h3>
        <ul className="mt-3 space-y-2">
          {spacing.map((size) => (
            <li key={size} className="flex items-center gap-3">
              <span className="w-8 text-[12px] tabular-nums text-muted">{size}</span>
              <span className="h-2 bg-ink" style={{ width: size }} />
            </li>
          ))}
        </ul>
        <h3 className="mt-8 text-[13px] leading-5 text-muted">Type</h3>
        <div className="mt-3 space-y-3">
          <p className="text-[32px] font-medium leading-[1.15] tracking-[-0.03em]">Ask only when you must</p>
          <p className="text-[20px] font-medium tracking-[-0.02em]">Confirm before you act</p>
          <p className="max-w-[62ch] text-[15px] leading-6 text-muted">Body at 15px, line height 24. The measure stays near 65 characters.</p>
          <p className="text-[13px] leading-5 text-muted">Interface text is 13px. Labels can be 12px if they are not the only instruction.</p>
          <p className="font-mono text-[12px] leading-5 text-muted">latch://catalog/v1</p>
        </div>
        <h3 className="mt-8 text-[13px] leading-5 text-muted">Color</h3>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {[
            ["Ink", "var(--ink)"],
            ["Muted", "var(--muted)"],
            ["Line", "var(--line)"],
            ["Accent", "var(--accent)"],
            ["Surface", "var(--surface)"],
            ["Confirmed", "var(--ok)"],
            ["Error", "var(--danger)"],
            ["Reroute", "var(--warn)"],
          ].map(([name, color]) => (
            <li key={name} className="flex items-center gap-2 text-[13px]">
              <span className="size-3 border border-line" style={{ background: color }} />
              {name}
            </li>
          ))}
        </ul>
        <h3 className="mt-8 text-[13px] leading-5 text-muted">Radius</h3>
        <div className="mt-3 flex gap-4">
          {[
            ["6", "rounded-[6px]"],
            ["10", "rounded-[10px]"],
            ["14", "rounded-[14px]"],
          ].map(([label, radius]) => (
            <div key={label} className="text-[12px] text-muted">
              <div className={`mb-1 size-10 border border-line-strong ${radius}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      <h2 className="mb-2 mt-14 text-[20px] font-medium tracking-[-0.02em]">One principle each</h2>
      <p className="max-w-[62ch] text-[14px] leading-6 text-muted">If a component needs a second idea, it is probably two components.</p>
      <ol className="mt-6 max-w-[680px] divide-y divide-line border-y border-line">
        {components.map((item, index) => (
          <li key={item.slug} className="grid gap-1 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
            <Link href={`/components/${item.slug}`} className="text-[14px] font-medium">
              {index + 1}. {item.name}
            </Link>
            <p className="text-[14px] leading-6 text-muted">{item.principle}</p>
          </li>
        ))}
      </ol>

      <h2 className="mb-3 mt-14 text-[20px] font-medium tracking-[-0.02em]">Motion</h2>
      <p className="max-w-[62ch] text-[15px] leading-7 text-muted">
        The current thinking step fades, and only that. Reduced motion removes the fade. Nothing else moves to prove that work is happening. There is no elapsed-time counter.
      </p>
    </article>
  );
}
