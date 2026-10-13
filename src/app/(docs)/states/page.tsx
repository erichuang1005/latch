import type { Metadata } from "next";
import { StatesGallery } from "@/docs/component-docs";

export const metadata: Metadata = { title: "States" };

export default function StatesPage() {
  return <StatesGallery />;
}
