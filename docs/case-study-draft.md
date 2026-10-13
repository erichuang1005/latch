# Case study draft

Working title: Latch. A catalog for agents that ask only when they must.

This is a skeleton for a portfolio piece. It is an independent side project. The examples are fictional: a team offsite, a laptop request, a venue. Do not add employer names, product names, or internal flows. Do not invent metrics. The result lines are placeholders.

## Problem

Agents are handed a goal and some reference material, then they either talk too much or act too quietly.

They re-ask for facts the brief already has. They hand a request to the wrong specialist and the correction disappears. They take a consequential step, a hold, a purchase, a send, on a single approve button that does not show the facts. The person cannot see who is handling the work, and cannot see what was true at the moment they agreed.

The interface for that behavior is usually improvised inside a chat transcript: a paragraph, a button, a toast. The open catalogs (A2UI’s basic set, AI Elements, assistant-ui’s approval card, CopilotKit’s pause) cover pieces of it. None of them give an agent a catalog for the whole sequence.

## Decisions

### 1. A catalog, not a chat kit

Latch does not stream tokens or store a thread. It is an A2UI catalog, `latch://catalog/v1`, that a client renders with its own components. The agent sends the same JSON to any client that has agreed on the catalog. Chat chrome can host it. A chat framework is not the product.

### 2. One missing fact, then the question leaves

If the brief has the city, the month, and the headcount, the agent does not ask for them. ClarifyForm is one question, a few chips, and an optional field. After the answer, it collapses to a row. The transcript keeps the fact without keeping the form.

### 3. A wrong handoff is a logged misroute

“Handled by Travel” is not a label. The person can change it. Changing it writes “Logged as a misroute · Travel → Events” and the plan underneath updates. The confirm card still has to be reviewed, because the facts changed. Attribution in A2UI (`agentDisplayName`) stays useful. The correction is a separate, visible act.

## What changed while building

- The first pass treated every state as a colored banner. That made error, loading, and reroute look like the same component. Loading became a sentence. A misroute became one warn-colored line. Confirmed stayed in the same card instead of swapping in a success panel.
- Thinking steps were almost a card with a duration, which is what several chat kits do. They lost the card and the timer. The only motion left is a fade on the current step, and reduced motion removes it.
- The primary action was going to be the accent blue. It became ink, compact, and trailing, so the facts stay louder than the button.
- The demo was going to ask a short interview (city, dates, headcount, budget). It now uses a reference brief and asks only for the budget. That is the thesis, so the demo had to obey it.
- Confirm was easy to make disappear after the click. It now remains, with “Confirmed by you,” so the agreement is still readable.
- Card titles started as headings. On a docs page that already has an h1 and h2s, that skipped levels and made two “Plan” regions into duplicate landmarks. Titles are now labeled groups. Scrollable props tables and JSON blocks take keyboard focus.

## Results

Do not fill these with guessed numbers. Replace each line with a real observation or delete it.

- [ ] Time from a brief to a held plan, with a person in the loop: 
- [ ] How often a pilot corrected the handler: 
- [ ] How often the agent asked a question the brief already answered, before and after: 
- [ ] Whether people could restate what they had confirmed, a day later: 
- [ ] What still felt like too much UI in the transcript: 

## What I would decide next

See the morning notes that shipped with the build. The open questions are the name, whether misroute is the right word for a correction, how strict “one question” should be when two facts are missing, and whether the catalog should stay additive to A2UI’s basic set or start absorbing it.
