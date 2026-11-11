import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

const location = { latitude: 12.9719, longitude: 77.6412, accuracy: 5 };
const photo = path.resolve("tests/e2e/fixtures/proof.png");

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test("requester and inspector complete a visit with multi-photo proof, revision and a PDF report", async ({ browser }, testInfo) => {
  const ownerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const inspectorContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, geolocation: location, permissions: ["geolocation"] });
  const owner = await ownerContext.newPage();
  const inspector = await inspectorContext.newPage();
  const exceptions: string[] = [];
  for (const page of [owner, inspector]) page.on("pageerror", (error) => exceptions.push(error.message));
  try {
    await owner.goto("http://localhost:5174/login");
    await owner.getByRole("button", { name: /Continue as Requester/ }).click();
    await expect(owner).toHaveURL(/\/user$/);
    await owner.goto("http://localhost:5174/user/create-task?plan=DETAILED");
    await owner.getByLabel("Google Maps link").fill("https://www.google.com/maps/search/?api=1&query=12.9719%2C77.6412");
    await owner.getByRole("button", { name: "Find this location" }).click();
    await owner.getByLabel("Notes for the inspector").fill("Browser journey: check the front gate and photograph the approach road.");
    await noOverflow(owner);
    await owner.getByRole("button", { name: "Request visit", exact: true }).first().click();
    await expect(owner).toHaveURL(/\/user\/tasks\/[^/]+$/);
    const taskId = new URL(owner.url()).pathname.split("/").at(-1)!;
    await expect(owner.getByText(/Detailed visit.*2,499/).first()).toBeVisible();
    await owner.getByRole("button", { name: "Edit request" }).click();
    await owner.getByLabel("Visit title").fill("Bengaluru boundary inspection");
    await owner.getByRole("button", { name: "Save changes" }).click();
    await expect(owner.getByRole("heading", { name: "Bengaluru boundary inspection" })).toBeVisible();

    await inspector.goto("http://localhost:5174/login");
    await inspector.getByRole("button", { name: /Continue as Inspector/ }).click();
    await inspector.getByRole("button", { name: "Use my location" }).click();
    await expect(inspector.getByText("Bengaluru boundary inspection")).toBeVisible();
    await inspector.goto(`http://localhost:5174/captain/tasks/${taskId}`);
    await inspector.getByRole("button", { name: "Accept visit", exact: true }).click();
    await inspector.getByRole("dialog").getByRole("button", { name: "Accept visit", exact: true }).click();
    await inspector.getByRole("button", { name: "Start visit", exact: true }).click();
    await expect(inspector.getByText("Sharing your location with the requester", { exact: true })).toBeVisible();
    await inspector.getByRole("button", { name: "Take a proof photo" }).click();
    await expect(inspector).toHaveURL(/\/upload$/);
    // Chromium has no camera here: the real upload fallback must remain usable.
    await inspector.locator("#evidence-file").setInputFiles(photo);
    await inspector.getByLabel("Supporting photos (optional)").setInputFiles(photo);
    await inspector.getByLabel("Inspector’s findings").fill("The front gate is intact. The road is accessible by car.");
    await inspector.getByRole("button", { name: "Submit proof", exact: true }).filter({ visible: true }).click();
    await expect(inspector).toHaveURL(new RegExp(`/captain/tasks/${taskId}$`));
    await expect(owner.getByRole("heading", { name: "Your proof is ready." })).toBeVisible();
    await expect(owner.getByText("Supporting photos (1)")).toBeVisible();
    await owner.getByRole("button", { name: "Request revised proof", exact: true }).click();
    await owner.getByLabel("What needs to be checked again?").fill("Please check the rear boundary and add that finding too.");
    await owner.getByRole("dialog").getByRole("button", { name: "Request revised proof" }).click();
    await expect(inspector.getByRole("heading", { name: "Revised proof requested" })).toBeVisible();
    await inspector.getByRole("button", { name: "Take a proof photo" }).click();
    await inspector.locator("#evidence-file").setInputFiles(photo);
    await inspector.getByLabel("Supporting photos (optional)").setInputFiles(photo);
    await inspector.getByLabel("Inspector’s findings").fill("Both boundaries are intact. Access is clear. All requested checks completed.");
    await inspector.getByRole("button", { name: "Submit proof", exact: true }).filter({ visible: true }).click();
    await expect(owner.getByRole("heading", { name: "Your proof is ready." })).toBeVisible();
    await owner.getByRole("link", { name: "View / print report" }).click();
    await expect(owner.getByRole("button", { name: "Print / save as PDF" })).toBeEnabled();
    await expect(owner.getByText("Both boundaries are intact. Access is clear. All requested checks completed.").first()).toBeVisible();
    await noOverflow(owner);
    await owner.screenshot({ path: testInfo.outputPath("report-mobile.png"), fullPage: true });
    const pdf = await owner.pdf({ path: testInfo.outputPath("visit-report.pdf"), format: "A4", printBackground: true });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    await owner.getByRole("link", { name: "Back to visit" }).click();
    await owner.getByRole("button", { name: "View photo", exact: true }).click();
    const download = owner.waitForEvent("download");
    await owner.getByRole("link", { name: "Download proof photo" }).click();
    expect((await download).suggestedFilename()).toContain(taskId);
    await owner.getByRole("dialog").getByRole("button", { name: /Close/ }).click();
    await owner.getByRole("button", { name: "Mark complete", exact: true }).click();
    await owner.getByRole("button", { name: "Yes, mark complete" }).click();
    await expect(owner.getByRole("heading", { name: "All done. Your proof is saved." })).toBeVisible();
    await noOverflow(owner);
    await owner.screenshot({ path: testInfo.outputPath("completed-mobile.png"), fullPage: true });
    await owner.goto("http://localhost:5174/user/account");
    await owner.getByLabel("Full name").fill("Asha Rao");
    await owner.getByLabel("Email (optional)").fill("asha@example.test");
    await owner.getByRole("button", { name: "Save changes" }).click();
    await expect(owner.getByText("Account updated.")).toBeVisible();
    await owner.reload();
    await expect(owner.getByLabel("Full name")).toHaveValue("Asha Rao");
    await noOverflow(owner);
    expect(exceptions).toEqual([]);
  } finally {
    await ownerContext.close();
    await inspectorContext.close();
  }
});
