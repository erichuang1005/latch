import type { ReactNode } from "react";
import { DocsSidebar } from "@/docs/site-header";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] gap-10 px-4 sm:px-6">
      <DocsSidebar />
      <main id="content" className="min-w-0 flex-1 py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
