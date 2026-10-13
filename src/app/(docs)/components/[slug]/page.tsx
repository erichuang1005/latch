import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentDocs } from "@/docs/component-docs";
import { components, getComponent } from "@/docs/content";

export function generateStaticParams() {
  return components.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getComponent(slug);
  return { title: doc?.name ?? "Component", description: doc?.principle };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getComponent(slug)) notFound();
  return <ComponentDocs slug={slug} />;
}
