/**
 * Latch embed. Framework-free ESM. No network calls.
 * Latch.mount(element, { demo: "citations" })
 */

const POLICY = {
  fileName: "TRV-3.pdf",
  kind: "Policy",
  title: "Field travel policy TRV-3",
};

const PAGES = {
  booking: {
    page: 1,
    pageCount: 2,
    lines: [
      { id: "intro", text: "Field travel policy TRV-3. Sample file, not a live policy." },
      { id: "purpose", text: "1. Purpose. This covers trips taken for Harbor & Co." },
      { id: "who", text: "It applies to employees and to contractors on a Harbor engagement." },
      { id: "booking-h", text: "2. Booking." },
      { id: "cap", text: "A trip at or under €1,500 can be booked by the traveler." },
      { id: "above", text: "Above €1,500, a manager approves the fare before it is bought." },
      { id: "keep", text: "The traveler keeps the confirmation with the expense report." },
    ],
  },
  meals: {
    page: 2,
    pageCount: 2,
    lines: [
      { id: "meals-h", text: "3. Meals." },
      { id: "cap-meal", text: "Meals on a travel day are capped at €75." },
      { id: "alcohol", text: "Alcohol is not reimbursed." },
      { id: "client", text: "A meal with a client uses the same cap unless finance agrees in writing." },
      { id: "receipts-h", text: "4. Receipts." },
      { id: "file", text: "A receipt is filed within 14 days of the trip." },
      { id: "names", text: "The receipt names the vendor, the date, and the amount." },
      { id: "missing", text: "A missing receipt is paid back only with a manager note." },
    ],
  },
};

const CITATIONS = [
  {
    id: "cap",
    label: "€1,500",
    name: "€1,500, Field travel policy TRV-3",
    lineId: "cap",
    pageKey: "booking",
  },
  {
    id: "meal",
    label: "€75",
    name: "€75, Field travel policy TRV-3",
    lineId: "cap-meal",
    pageKey: "meals",
  },
  {
    id: "file",
    label: "14 days",
    name: "14 days, Field travel policy TRV-3",
    lineId: "file",
    pageKey: "meals",
  },
];

const mounts = new WeakMap();

function el(tag, props, children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  for (const child of children || []) {
    if (child) node.append(child);
  }
  return node;
}

function placeOverlay(card, anchor) {
  const margin = 8;
  const width = Math.min(300, window.innerWidth - margin * 2);
  card.style.width = `${width}px`;
  const anchorBox = anchor.getBoundingClientRect();
  const height = card.offsetHeight;
  let left = anchorBox.left + anchorBox.width / 2 - width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
  let top = anchorBox.top - height - 10;
  if (top < margin) top = anchorBox.bottom + 10;
  if (top + height > window.innerHeight - margin) {
    top = Math.max(margin, window.innerHeight - height - margin);
  }
  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(top)}px`;
}

function renderPage(cite) {
  const page = PAGES[cite.pageKey];
  const titleId = `latch-doc-${cite.id}`;
  const lines = el(
    "ul",
    { class: "latch-lines" },
    page.lines.map((line) => {
      const cited = line.id === cite.lineId;
      return el("li", {
        class: cited ? "latch-line is-cited" : "latch-line",
        "data-line-id": line.id,
        "aria-current": cited ? "true" : null,
        text: line.text,
      });
    }),
  );
  const dialog = el("div", {
    class: "latch-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": titleId,
    tabindex: "-1",
    "data-testid": "source-overlay",
  });
  const sheet = el("article", { class: "latch-page" }, [
    el("p", { class: "latch-file", text: POLICY.fileName }),
    el("h3", { class: "latch-doc-title", id: titleId, text: POLICY.title }),
    lines,
    el("p", { class: "latch-page-no", text: String(page.page) }),
  ]);
  const close = el("button", {
    class: "latch-close",
    type: "button",
    "aria-label": "Close source",
    text: "Close",
  });
  const caption = el("div", { class: "latch-caption" }, [
    el("p", { text: `${POLICY.kind} · ${POLICY.fileName} · Page ${page.page} of ${page.pageCount}` }),
    close,
  ]);
  dialog.append(sheet, caption);
  return { dialog, close };
}

function mountCitations(root) {
  const buttons = new Map();
  let openId = null;
  let dialog = null;
  let restoreFocus = null;

  const answer = el("p", { class: "latch-answer" });
  answer.append("A trip at or under ");
  answer.append(citeButton(CITATIONS[0]));
  answer.append(" can be booked by the traveler. Meals on a travel day stay within ");
  answer.append(citeButton(CITATIONS[1]));
  answer.append(", and the receipt is filed within ");
  answer.append(citeButton(CITATIONS[2]));
  answer.append(".");

  const chat = el("section", { class: "latch-chat", "aria-label": "Field travel" }, [
    el("p", { class: "latch-kicker", text: "Thread" }),
    el("h2", { class: "latch-title", text: "Field travel" }),
    el("div", { class: "latch-messages" }, [
      el("p", { class: "latch-user", text: "Can I book Lisbon myself, and when do I file the dinner receipt?" }),
      el("div", {}, [el("p", { class: "latch-agent-name", text: "Latch" }), answer]),
    ]),
  ]);
  root.append(chat);

  function citeButton(cite) {
    const button = el("button", {
      class: "latch-cite",
      type: "button",
      "aria-label": cite.name,
      "aria-expanded": "false",
      "aria-haspopup": "dialog",
      text: cite.label,
    });
    button.addEventListener("click", () => toggle(cite.id, button));
    buttons.set(cite.id, button);
    return button;
  }

  function onKeyDown(event) {
    if (!dialog) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const closeButton = dialog.querySelector(".latch-close");
    if (!closeButton) return;
    event.preventDefault();
    closeButton.focus();
  }

  function onPointerDown(event) {
    if (!dialog) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (dialog.contains(target)) return;
    if (target instanceof Element && target.closest(".latch-cite")) return;
    close();
  }

  function onPlace() {
    if (!dialog || !openId) return;
    const button = buttons.get(openId);
    if (button) placeOverlay(dialog, button);
  }

  function close() {
    if (!dialog) return;
    dialog.remove();
    dialog = null;
    const button = openId ? buttons.get(openId) : null;
    if (button) button.setAttribute("aria-expanded", "false");
    openId = null;
    const back = restoreFocus;
    restoreFocus = null;
    if (back && back.isConnected) back.focus();
  }

  function open(id, button) {
    const cite = CITATIONS.find((item) => item.id === id);
    if (!cite) return;
    if (dialog) {
      dialog.remove();
      dialog = null;
      for (const [key, node] of buttons) {
        if (key !== id) node.setAttribute("aria-expanded", "false");
      }
    }
    const view = renderPage(cite);
    dialog = view.dialog;
    document.body.append(dialog);
    placeOverlay(dialog, button);
    button.setAttribute("aria-expanded", "true");
    openId = id;
    restoreFocus = button;
    view.close.addEventListener("click", close);
    dialog.focus();
  }

  function toggle(id, button) {
    if (openId === id) close();
    else open(id, button);
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("resize", onPlace);
  window.addEventListener("scroll", onPlace, true);

  return function destroy() {
    close();
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("resize", onPlace);
    window.removeEventListener("scroll", onPlace, true);
  };
}

const demos = {
  citations: mountCitations,
};

export function mount(element, options = {}) {
  if (!element || element.nodeType !== 1) {
    throw new Error("Latch.mount expects an element.");
  }
  const previous = mounts.get(element);
  if (previous) previous();
  const name = options.demo || "citations";
  const render = demos[name] || demos.citations;
  element.classList.add("latch-root");
  element.replaceChildren();
  const destroyDemo = render(element);
  const destroy = () => {
    destroyDemo();
    element.replaceChildren();
    element.classList.remove("latch-root");
    mounts.delete(element);
  };
  mounts.set(element, destroy);
  return destroy;
}

const Latch = { mount };
globalThis.Latch = Latch;
export default Latch;
