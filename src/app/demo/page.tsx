import type { Metadata } from "next";
import { RenewalChat } from "@/docs/renewal-chat";

export const metadata: Metadata = {
  title: "Demo",
  description: "A chat whose figures open the contract, the invoice, the policy, and the thread.",
};

export default function DemoPage() {
  return (
    <main id="content" className="lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
      <RenewalChat />
    </main>
  );
}
