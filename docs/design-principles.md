# Design principles

Latch is for a transcript, not a dashboard. A component should read like a sentence that happens to contain a decision. Light mode is the default. Dark mode uses the same relationships with inverted ink.

## Tokens

Spacing follows a 4px grid: 4, 8, 12, 16, 24, 32, 48, 64. Tailwind’s default scale already is that grid (`p-1` is 4px, `p-2` is 8px). Do not introduce a one-off 10px padding.

Type:

| Use | Size | Line |
| --- | --- | --- |
| Page title | 32–44 | 1.12–1.15 |
| Section | 20–24 | 1.3 |
| Component title | 15 | 20 |
| Body | 15–16 | 24–28 |
| Interface | 13 | 20 |
| Meta | 12 | 16 |

The reading measure stays near 65 characters. Titles use medium weight and a small negative tracking. Interface text does not.

Radius: 6px for controls and chips, 10px for a decision surface, 14px for a page frame. Pills are fully round. Do not round a thinking line. It is not a surface.

Color, light:

| Token | Value | Use |
| --- | --- | --- |
| bg | `#f6f6f4` | Page |
| surface | `#ffffff` | Decision surfaces |
| ink | `#1c1c1a` | Text and the primary action |
| muted | `#4a4a45` | Secondary text |
| faint | `#5c5c55` | Hints and arrows |
| line | `#e6e6e1` | Hairlines |
| accent | `#1d4ed8` | Links and the focus ring only |
| ok | `#0f6e56` | Confirmed, included |
| danger | `#b42318` | Errors |
| warn | `#8a5a00` | A misroute |

The accent is not a fill for primary buttons. The primary button is ink. Color is never the only signal: a status has a word, a misroute has a sentence, a check chip has a label.

Dark mode swaps ink and surface and lightens the status colors. It does not introduce a second accent.

## One principle per component

1. **ConfirmCard.** A consequential action is a review, not a button. The rows are the facts that would change the decision. The checks are already true. The verb is short, trailing, and compact. After the person agrees, the card stays, marked confirmed.
2. **ClarifyForm.** Ask only for the one fact that blocks the work. Chips for the likely answers, an optional field for the rest. Then collapse the question into a summary row.
3. **HandoffCard.** Name who is handling the request, and make a wrong handoff correctable. The correction is logged as a misroute.
4. **ThinkingSteps.** Show the work as quiet prose. Gray text, arrows, no card, no timer, no spinner.
5. **ChoiceList.** A decision is a list with one selected. Options may have a line of detail. They are not a row of equal primary buttons.
6. **ItemSummary.** Quantity and money stay visible and editable until confirm. A removed line stays visible at zero. The subtotal is in the same surface.
7. **StatusPill / Toast.** A status is a short sentence. “Added.” “Confirmed.” Color supports the word. A toast sits where the action happened and can be dismissed.
8. **Citation.** A figure in the sentence is the citation. The pill opens the file it came from, in a pane beside the answer, scrolled to that line and highlighted. A contract clause, an invoice row, a policy line, or a thread message is the source. A website blurb is not.

## Motion and input

The current thinking step may fade. `prefers-reduced-motion: reduce` removes that fade. Nothing else animates to imply progress.

Every control is a real button, link, radio, or checkbox. Focus is a 2px accent ring, offset from the control. Arrow keys move inside a choice group because the group is a radio group.

## What not to add

A second accent. A shadow under every card. A skeleton made of gray boxes. An avatar for every agent. A timer on thinking. A confirm that disappears after the click. A form that asks for facts the brief already contains.
