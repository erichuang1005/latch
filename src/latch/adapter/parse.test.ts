import { describe, expect, it } from "vitest";
import { confirmCardMessages, legacyTextJsonl, summaryMessages } from "@/latch/adapter/examples";
import { parseA2ui } from "@/latch/adapter/parse";
import { validateLatchProps } from "@/latch/adapter/schema";

describe("parseA2ui", () => {
  it("reads a v0.9.1 Latch confirm card", () => {
    const parsed = parseA2ui(confirmCardMessages);
    const surface = parsed.surfaces.find((item) => item.id === "hold");
    expect(surface?.ready).toBe(true);
    expect(surface?.rootId).toBe("root");
    expect(surface?.theme?.agentDisplayName).toBe("Travel");
    const card = surface?.components.get("root");
    expect(card?.type).toBe("ConfirmCard");
    expect(card?.props.title).toBe("Hold the Lisbon rooms");
    expect(card?.action?.name).toBe("confirm_hold");
    expect(parsed.issues).toEqual([]);
  });

  it("unwraps a v0.8 literalString and waits for beginRendering", () => {
    const parsed = parseA2ui(legacyTextJsonl);
    const surface = parsed.surfaces[0];
    expect(surface.rootId).toBe("root");
    expect(surface.ready).toBe(true);
    expect(surface.components.get("root")?.props.text).toBe("Hello from v0.8");
    expect(surface.components.get("root")?.props.usageHint).toBe("h3");
  });

  it("does not render a v0.8 surface before beginRendering", () => {
    const parsed = parseA2ui({
      surfaceUpdate: {
        surfaceId: "main",
        components: [{ id: "root", component: { Text: { text: { literalString: "Wait" } } } }],
      },
    });
    expect(parsed.surfaces[0].ready).toBe(false);
  });

  it("resolves a data-model path into a line price", () => {
    const parsed = parseA2ui(summaryMessages);
    const surface = parsed.surfaces[0];
    expect(surface.data).toMatchObject({ dinner: 55 });
    const items = surface.components.get("root")?.props.items as { unitPrice: unknown }[];
    expect(items[2].unitPrice).toEqual({ path: "/dinner" });
  });

  it("drops a deleted surface", () => {
    const parsed = parseA2ui([
      { createSurface: { surfaceId: "gone", catalogId: "latch://catalog/v1" } },
      { deleteSurface: { surfaceId: "gone" } },
    ]);
    expect(parsed.surfaces[0].deleted).toBe(true);
  });

  it("reports a bad JSONL line and keeps the valid one", () => {
    const parsed = parseA2ui('not json\n{"createSurface":{"surfaceId":"ok","catalogId":"latch://catalog/v1"}}');
    expect(parsed.issues).toHaveLength(1);
    expect(parsed.surfaces[0].id).toBe("ok");
  });

  it("rejects a confirm card with no title", () => {
    const result = validateLatchProps("ConfirmCard", { rows: [] });
    expect(result.success).toBe(false);
  });
});
