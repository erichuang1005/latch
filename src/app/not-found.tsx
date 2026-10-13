import Link from "next/link";

export default function NotFound() {
  return (
    <main id="content" className="mx-auto max-w-[640px] px-4 py-20">
      <h1 className="text-[32px] font-medium tracking-[-0.03em]">That page is not in the catalog.</h1>
      <p className="mt-3 text-[15px] leading-6 text-muted">The component may have been renamed, or the link is stale.</p>
      <Link href="/components" className="mt-4 inline-block text-[13px] text-ink underline decoration-line underline-offset-4">
        Back to components
      </Link>
    </main>
  );
}
