import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/docs/content";

export const metadata: Metadata = { title: "Components" };

export default function ComponentsPage() {
  return (
    <article>
      <p className="text-[13px] leading-5 text-muted">Catalog</p>
      <h1 className="mt-1 text-[32px] font-medium leading-[1.15] tracking-[-0.03em]">Components</h1>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-6 text-muted">
        Eight surfaces. Each one has a principle, a preview, the states it actually uses, and an A2UI message.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {components.map((item) => (
          <li key={item.slug}>
            <Link href={`/components/${item.slug}`} className="block py-4">
              <span className="text-[16px] font-medium">{item.name}</span>
              <span className="mt-1 block max-w-[62ch] text-[14px] leading-6 text-muted">{item.principle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
