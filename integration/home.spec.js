// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test("has title", async ({ page }) => {
    const routes = [
        { url: "**/api/transactions/income", response: [], status: 200 },
        { url: "**/api/transactions/spend", response: [], status: 200 },
        { url: "*/**/api/balance", response: { balance: 12 }, status: 200 }
    ];
    await pageSetup({ page, routes });

    await expect(page.locator("[data-test-id=\"header-title\"]")).toHaveText(/Finance Tracker/);
});

test("has balance", async ({ page }) => {
    await pageSetup({ page });

    await expect(page.locator("#balance-value")).toHaveText(/\$\s*\d+/);
});
