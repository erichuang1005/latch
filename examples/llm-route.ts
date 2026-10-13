/**
 * Optional model route. Not part of the static site.
 *
 * Copy this into a Next.js route handler (app/api/agent/route.ts) on a server
 * that is allowed to hold a secret. The docs site is a static export and does
 * not call it. With no key, the function returns the scripted mode.
 *
 *   LATCH_LLM_API_KEY    required, or the response stays scripted
 *   LATCH_LLM_BASE_URL   default https://api.openai.com/v1/chat/completions
 *   LATCH_LLM_MODEL      default is a placeholder; set the model you actually have
 */

const SYSTEM = `You produce A2UI v0.9.1 messages for the Latch catalog (catalogId "latch://catalog/v1").
The user has a goal and this reference brief: 12 people, Lisbon, a week in May.
Ask only for a fact the brief does not contain. In this brief the missing fact is the budget.
Do not ask for the city, the month, or the headcount.
Name the handler. Default to Travel. If the user corrects it, emit a HandoffCard with state "rerouted".
Before any hold, purchase, or send, emit a ConfirmCard and wait.
Return JSON: { "messages": [ A2UI envelopes ] }. Use only ConfirmCard, ClarifyForm, HandoffCard, ThinkingSteps, ChoiceList, ItemSummary, StatusPill, Citation, Text, Column, Row.`;

export async function latchAgentResponse(goal: string) {
  const key = process.env.LATCH_LLM_API_KEY;
  if (!key) {
    return { mode: "scripted" as const, message: "Set LATCH_LLM_API_KEY to call a model. The demo runs without one." };
  }

  const endpoint = process.env.LATCH_LLM_BASE_URL ?? "https://api.openai.com/v1/chat/completions";
  const model = process.env.LATCH_LLM_MODEL ?? "set-me";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: goal },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return { mode: "error" as const, status: response.status };
  }
  return { mode: "model" as const, body: await response.json() };
}
