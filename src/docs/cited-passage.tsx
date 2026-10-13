"use client";

import { cn } from "@/lib/utils";
import { Cite } from "@/latch/components/source-workspace";

export function RenewalAnswer({ detailed = false, className }: { detailed?: boolean; className?: string }) {
  return (
    <div data-testid="cited-passage" className={cn("max-w-[62ch] text-[16px] leading-8", className)}>
      <p>
        The renewal sits under the <Cite documentId="policy" lineId="cap" label="€25,000">€25,000</Cite> second-approval line. The agreement allows{" "}
        <Cite documentId="agreement" lineId="notice" label="30 days">30 days</Cite> notice, and invoice INV-2041 shows{" "}
        <Cite documentId="invoice" lineId="platform" label="€18,400">€18,400</Cite> for the platform
        {detailed ? (
          <>
            , with <Cite documentId="order" lineId="due" label="€26,500">€26,500</Cite> due. Finance already logged the cap in the{" "}
            <Cite documentId="thread" lineId="logged" label="renewals thread">renewals thread</Cite>.
          </>
        ) : (
          "."
        )}
      </p>
    </div>
  );
}
