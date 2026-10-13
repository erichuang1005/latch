# Latch

Latch is an open-source catalog of interface components for agents that ask only when they must, name who is handling the work, and confirm before they act.

The components speak [A2UI](https://a2ui.org/) v0.9.1. An agent sends a small JSON message. A client that knows the catalog, `latch://catalog/v1`, renders it. The same message can land in a chat, a document, or a note.

The examples are fictional: a team offsite, a laptop request, a travel policy. Latch is not published to npm yet.

## Live demo

Deploy the static export, then replace this placeholder with the public URL:

https://REPLACE-WITH-YOUR-LATCH-DEMO

## Components

| Component | What it is for |
| --- | --- |
| ConfirmCard | A consequential action is a review, not a button. |
| ClarifyForm | Ask only for the one fact that blocks the work, then collapse it. |
| HandoffCard | Name who is handling the request, and log a wrong handoff. |
| ThinkingSteps | Show the work as quiet prose. No card, no timer. |
| ChoiceList | A decision is a list with one selected. |
| ItemSummary | Quantity and money stay editable until confirm. |
| StatusPill | A status is a short sentence. |
| Citation | The figure in the sentence opens the source file, on the line that supports it. |

The adapter also accepts A2UI v0.8 streams (`surfaceUpdate`, `beginRendering`, `literalString`) and renders Text, Row, Column, Card, Button, and Divider from the basic catalog. Anything else is reported as unsupported.

## Install

The package entry is TypeScript source. Peer dependencies are React 19 and React DOM 19.

```bash
npm install github:erichuang1005/latch
```

```tsx
import { ConfirmCard } from "latch-ui";
import "latch-ui/tokens.css";

export function Hold() {
  return (
    <ConfirmCard
      title="Hold the Lisbon rooms"
      rows={[
        { label: "When", value: "12–16 May" },
        { label: "People", value: "12" },
      ]}
      checks={["Refundable until 1 May"]}
      actionLabel="Confirm hold"
      onConfirm={() => {}}
    />
  );
}
```

Render a message the agent already produced:

```tsx
import { A2uiRenderer } from "latch-ui";

export function Surface({ messages }: { messages: unknown }) {
  return <A2uiRenderer input={messages} onAction={(action) => console.log(action)} />;
}
```

## Embed

`embed/` is a framework-free bundle for a static page. It does not call a CDN. Load the stylesheet, then mount the citations demo:

```html
<link rel="stylesheet" href="./latch.css" />
<div id="latch"></div>
<script type="module">
  import { mount } from "./latch.js";
  mount(document.querySelector("#latch"), { demo: "citations" });
</script>
```

`Latch.mount` is the same function. Details, keyboard behavior, and a minimal `example.html` are in [embed/README.md](embed/README.md).

## Develop

```bash
npm install
npm run dev
```

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

`npm run build` writes a static export to `out/`.

The demo on the site is scripted. `examples/llm-route.ts` shows a server handler that calls an OpenAI-compatible API when `LATCH_LLM_API_KEY` is set, and stays scripted when it is not. The static site does not mount that route.

## License

[MIT](LICENSE) © Eric Huang
