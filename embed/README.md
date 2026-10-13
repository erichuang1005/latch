# Latch embed

A self-contained browser bundle for one Latch demo: an answer whose figures open the policy page they came from. No framework, no build step, and no requests to a CDN.

## Files

- `latch.js` — ESM module. Sets `Latch.mount` and exports `mount`.
- `latch.css` — styles for the demo. Load it on the page. The script does not fetch it.
- `example.html` — a minimal page that mounts the demo.

## Embed

Put the two assets next to the page (or serve them from the same origin) and mount into an empty element:

```html
<link rel="stylesheet" href="./latch.css" />
<div id="latch"></div>
<script type="module">
  import { mount } from "./latch.js";
  mount(document.querySelector("#latch"), { demo: "citations" });
</script>
```

`demo` defaults to `"citations"`. `mount` returns a function that removes the demo and its listeners.

```js
const unmount = Latch.mount(element, { demo: "citations" });
unmount();
```

The global is available after the module loads:

```html
<script type="module" src="./latch.js"></script>
<script type="module">
  Latch.mount(document.querySelector("#latch"), { demo: "citations" });
</script>
```

## What the demo does

The thread is a question about booking a trip and filing a receipt. The answer cites three figures from a fictional field-travel policy, `TRV-3.pdf`:

- €1,500 opens the booking line.
- €75 opens the meal cap.
- 14 days opens the receipt deadline.

Clicking or tapping a figure lays the PDF page over the answer, with that line highlighted. Choosing another figure swaps the page. Close, a click outside the page, or Escape dismisses it and returns focus to the figure.

The policy text is sample copy for Harbor & Co. It is not a live policy.

## Keyboard

Figures are buttons. Enter or Space opens the page. Escape closes it. The close control is in the page’s tab order. Focus rings stay visible.

## Layout

The answer column stays within 60 characters. The page preview is `position: fixed`, so opening it does not reflow the thread. On a narrow screen the preview uses the viewport width minus a small margin.
