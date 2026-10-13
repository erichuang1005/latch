import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const pages = [
  ["home", "/"],
  ["principles", "/principles"],
  ["components", "/components"],
  ["confirm-card", "/components/confirm-card"],
  ["clarify-form", "/components/clarify-form"],
  ["handoff", "/components/handoff"],
  ["thinking-steps", "/components/thinking-steps"],
  ["choice-list", "/components/choice-list"],
  ["item-summary", "/components/item-summary"],
  ["status", "/components/status"],
  ["citation", "/components/citation"],
  ["states", "/states"],
  ["research", "/research"],
  ["demo", "/demo"],
];

test.describe("docs and demo", () => {
  for (const [name, url] of pages) {
    test(`${name} has no overflow, no console errors, and no axe violations`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto(url, { waitUntil: "networkidle" });
      if (url === "/") await expect(page.getByRole("heading", { name: "Northwind renewal" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${name} horizontal overflow`).toBeLessThanOrEqual(1);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
      expect(errors, errors.join("\n")).toEqual([]);
      const dir = path.join("qa-shots", testInfo.project.name);
      fs.mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
    });
  }
});

test("a figure opens the source line", async ({ page }, testInfo) => {
  await page.goto("/demo", { waitUntil: "networkidle" });
  const dir = path.join("qa-shots", testInfo.project.name, "demo-flow");
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, "01-ready.png") });
  await page.getByRole("button", { name: "€18,400, Invoice INV-2041" }).click();
  await expect(page.getByRole("heading", { name: "Invoice INV-2041" })).toBeVisible();
  const line = page.locator("[data-line-id='platform']");
  await expect(line).toBeVisible();
  await expect(line).toContainText("€18,400");
  await page.screenshot({ path: path.join(dir, "02-clarify.png") });
  await page.getByRole("button", { name: "30 days, Services agreement" }).click();
  await expect(page.getByRole("heading", { name: "Services agreement" })).toBeVisible();
  await expect(page.locator("[data-line-id='notice']")).toContainText("thirty (30) days");
  await page.screenshot({ path: path.join(dir, "03-review.png") });
  await page.getByRole("button", { name: "renewals thread, Renewals" }).click();
  await expect(page.locator("[data-line-id='logged']")).toContainText("second-approval cap");
  await page.screenshot({ path: path.join(dir, "04-reroute.png") });
  await page.screenshot({ path: path.join(dir, "05-confirmed.png") });
});
