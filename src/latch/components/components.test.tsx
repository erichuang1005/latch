import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { A2uiRenderer } from "@/latch/adapter/renderer";
import { confirmCardMessages } from "@/latch/adapter/examples";
import { RenewalAnswer } from "@/docs/cited-passage";
import { RenewalChat } from "@/docs/renewal-chat";
import { Cite, SourceWorkspace } from "@/latch/components/source-workspace";
import { sampleDocuments } from "@/docs/sample-sources";
import { ClarifyForm } from "@/latch/components/clarify-form";
import { ConfirmCard } from "@/latch/components/confirm-card";
import { HandoffCard } from "@/latch/components/handoff-card";
import { ItemSummary } from "@/latch/components/item-summary";
import { ThinkingSteps } from "@/latch/components/thinking-steps";

const travel = { id: "travel", name: "Travel", detail: "Flights and rooms." };
const events = { id: "events", name: "Events", detail: "Venue and agenda." };

describe("components", () => {
  it("calls onConfirm from the trailing action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmCard title="Hold the Lisbon rooms" actionLabel="Confirm hold" onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Confirm hold" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("blocks confirm until the acknowledgement is checked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmCard
        title="Hold the Lisbon rooms"
        state="needs-input"
        acknowledgement="I have read the hold terms."
        actionLabel="Confirm hold"
        onConfirm={onConfirm}
      />,
    );
    const button = screen.getByRole("button", { name: "Confirm hold" });
    expect(button).toBeDisabled();
    await user.click(screen.getByRole("checkbox"));
    expect(button).toBeEnabled();
  });

  it("collapses a clarify form to the answer", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ClarifyForm
        question="What budget should this stay under?"
        choices={[{ value: "15000", label: "€15,000" }]}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "€15,000" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledWith({ value: "15000", label: "€15,000" });
  });

  it("logs a misroute when the handler changes", async () => {
    const user = userEvent.setup();
    const onReroute = vi.fn();
    render(<HandoffCard handledBy={travel} original={travel} alternatives={[events]} onReroute={onReroute} />);
    await user.click(screen.getByRole("button", { name: "Not right? Change" }));
    await user.click(screen.getByRole("radio", { name: "Events" }));
    expect(onReroute).toHaveBeenCalledWith(events, { from: "Travel", to: "Events" });
    render(<HandoffCard handledBy={events} original={travel} state="rerouted" />);
    expect(screen.getByText(/Logged as a misroute · Travel → Events/)).toBeInTheDocument();
  });

  it("writes thinking steps as prose without a timer", () => {
    const { container } = render(
      <ThinkingSteps
        steps={[
          { id: "a", label: "Reading the brief", status: "done" },
          { id: "b", label: "Drafting the hold", status: "current" },
        ]}
      />,
    );
    expect(screen.getByText(/Reading the brief/)).toBeInTheDocument();
    expect(container.querySelector("article, section")).toBeNull();
    expect(container.textContent).not.toMatch(/\d+\s?(s|sec|min|timer)/i);
  });

  it("updates a subtotal when quantity changes", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();
    render(
      <ItemSummary
        items={[{ id: "dinner", name: "Group dinner", quantity: 2, unitPrice: 55 }]}
        onQuantityChange={onQuantityChange}
      />,
    );
    expect(screen.getAllByText("€110")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Increase Group dinner" }));
    expect(onQuantityChange).toHaveBeenCalledWith("dinner", 3);
  });

  it("opens the invoice line from the figure in the sentence", async () => {
    const user = userEvent.setup();
    render(
      <SourceWorkspace documents={sampleDocuments} initialDocument="policy" initialLine="cap">
        <p>
          <Cite documentId="invoice" lineId="platform" label="€18,400">
            €18,400
          </Cite>
        </p>
      </SourceWorkspace>,
    );
    const figure = screen.getByRole("button", { name: "€18,400, Invoice INV-2041" });
    await user.hover(figure);
    expect(screen.getByTestId("source-preview")).toHaveTextContent("INV-2041.pdf");
    expect(document.querySelector('[data-testid="source-canvas"]')).not.toBeInTheDocument();

    await user.click(figure);
    const line = document.querySelector('[data-testid="source-canvas"] [data-line-id="platform"]');
    expect(line).toHaveClass("bg-highlight");
    expect(line).toHaveTextContent("Platform subscription, annual");
    expect(screen.getByRole("button", { name: "INV-2041.pdf, current file" })).toBeInTheDocument();
  });

  it("scrolls to another line in the same pdf without swapping the file", async () => {
    const user = userEvent.setup();
    render(
      <SourceWorkspace documents={sampleDocuments} initialDocument="invoice" initialLine="platform">
        <p>
          <Cite documentId="invoice" lineId="i6" label="€26,500">
            €26,500
          </Cite>
        </p>
      </SourceWorkspace>,
    );
    await user.click(screen.getByRole("button", { name: "€26,500, Invoice INV-2041" }));
    expect(document.querySelector('[data-testid="source-canvas"] [data-line-id="i6"]')).toHaveClass("bg-highlight");
    expect(screen.getByRole("button", { name: "INV-2041.pdf, current file" })).toBeInTheDocument();
  });

  it("closes the stack of files", async () => {
    const user = userEvent.setup();
    render(
      <SourceWorkspace documents={sampleDocuments} initialDocument="policy" initialLine="cap">
        <RenewalAnswer detailed />
      </SourceWorkspace>,
    );
    await user.click(screen.getByRole("button", { name: "€18,400, Invoice INV-2041" }));
    expect(screen.getByRole("button", { name: "Close documents" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close documents" }));
    expect(document.querySelector('[data-testid="source-canvas"]')).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close documents" })).not.toBeInTheDocument();
  });

  it("opens the next file from the stack", async () => {
    const user = userEvent.setup();
    render(
      <SourceWorkspace documents={sampleDocuments} initialDocument="policy" initialLine="cap">
        <p>
          <Cite documentId="policy" lineId="cap" label="€25,000">
            €25,000
          </Cite>
        </p>
      </SourceWorkspace>,
    );
    await user.click(screen.getByRole("button", { name: "€25,000, Approval policy POL-14" }));
    await user.click(screen.getByRole("button", { name: "Open services-agreement.pdf" }));
    expect(document.querySelector('[data-line-id="notice"]')).toHaveClass("bg-highlight");
  });

  it("opens a different file for each figure in the sentence", async () => {
    const user = userEvent.setup();
    render(
      <SourceWorkspace documents={sampleDocuments} initialDocument="policy" initialLine="cap">
        <RenewalAnswer detailed />
      </SourceWorkspace>,
    );
    const figures = [
      ["€25,000, Approval policy POL-14", "POL-14.pdf, current file"],
      ["30 days, Services agreement", "services-agreement.pdf, current file"],
      ["€18,400, Invoice INV-2041", "INV-2041.pdf, current file"],
      ["€26,500, Order HCO-118", "HCO-118.pdf, current file"],
      ["renewals thread, Renewals", "renewals.pdf, current file"],
    ] as const;
    for (const [figure, file] of figures) {
      await user.click(screen.getByRole("button", { name: figure }));
      expect(screen.getByRole("button", { name: file })).toBeInTheDocument();
    }
  });

  it("answers a follow-up from the pinned files", async () => {
    const user = userEvent.setup();
    render(<RenewalChat />);
    await user.type(screen.getByRole("textbox", { name: "Message" }), "What about notice?");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText("What about notice?")).toBeInTheDocument();
    expect(screen.getByText(/Notice stays in the agreement/)).toBeInTheDocument();
  });

  it("renders a confirm card from A2UI JSON", () => {
    render(<A2uiRenderer input={confirmCardMessages} />);
    expect(screen.getByRole("group", { name: "Hold the Lisbon rooms" })).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });
});
