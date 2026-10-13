# Contributing

Latch is a catalog with one principle per component. A change that needs a second principle is probably a second component.

## Setup

```bash
npm install
npm run dev
```

Before a change is ready:

```bash
npm run typecheck
npm run lint
npm run test
```

`npm run test:e2e` runs Playwright against the dev server in Chrome, Firefox, and WebKit at 1280 and 390. It checks axe, console errors, and horizontal overflow.

## Adding a component

1. Write the principle in one sentence and put it in `docs/design-principles.md` and `src/docs/content.ts`.
2. Build the React component in `src/latch/components`. Use the tokens. The primary action is ink, 28px tall, 13px type.
3. Cover the states that are real for it: idle, loading, needs input, confirmed, error, and rerouted when a wrong handoff can land here. Loading is a sentence. Do not add a timer.
4. Add a Zod schema in `src/latch/adapter/schema.ts` and a branch in the renderer.
5. Add an example A2UI v0.9.1 message in `src/latch/adapter/examples.ts`.
6. Add a docs preview. The page should show the principle, every state, the props, a do/don't, and the message rendered by the adapter.
7. Keep examples fictional. Travel, a software request, an event. No employer products, no real customer data.
8. Keyboard, name, and focus must work. Honor `prefers-reduced-motion`.

## Design bar

Read `docs/design-principles.md` before adding color, shadow, or motion. Hairlines over boxes. Accent is for links and focus, not for filling buttons.
