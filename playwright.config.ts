import { defineConfig, devices } from "@playwright/test";

const viewport = (width: number, height: number) => ({ viewport: { width, height } });

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:43123",
    reducedMotion: "reduce",
    trace: "off",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:43123",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: "chrome-1280", use: { ...devices["Desktop Chrome"], ...viewport(1280, 800) } },
    { name: "chrome-390", use: { ...devices["Desktop Chrome"], ...viewport(390, 844) } },
    { name: "firefox-1280", use: { ...devices["Desktop Firefox"], ...viewport(1280, 800) } },
    { name: "firefox-390", use: { ...devices["Desktop Firefox"], ...viewport(390, 844) } },
    { name: "webkit-1280", use: { ...devices["Desktop Safari"], ...viewport(1280, 800) } },
    { name: "webkit-390", use: { ...devices["Desktop Safari"], ...viewport(390, 844) } },
  ],
});
