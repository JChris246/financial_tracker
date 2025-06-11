// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.afterEach(async () => {
    await fetch("http://localhost:5000/api/admin/wipeDb"); // TODO: extract url
});

test("has title", async ({ page }) => {
    const routes = [
        { url: "**/api/transactions/income", response: [], status: 200 },
        { url: "**/api/transactions/spend", response: [], status: 200 },
        { url: "*/**/api/balance", response: { balance: 12 }, status: 200 }
    ];
    await pageSetup({ page, routes });

    await expect(page.locator("[data-test-id=\"header-title\"]")).toHaveText(/Finance Tracker/);
});

const addTransaction = async (page, value) => {
    const addTransactionButton = await page.locator("#add-transaction-button");

    await addTransactionButton.click();
    await page.locator("#transaction-name").fill("Test Transaction"); // Increment a count for this?
    await page.locator("#transaction-amount").fill(value);
    await page.locator("#submit-transaction").click();
};


test.describe("balance section", () => {
    test("has balance as 0 if no transactions", async ({ page }) => {
        await pageSetup({ page });

        await expect(page.locator("#balance-value")).toHaveText(/\$\s*0/);
    });

    test("has balance correct balance based on transaction history", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10");
        await addTransaction(page, "50");
        await addTransaction(page, "-20");

        await expect(page.locator("#balance-value")).toHaveText(/\$\s*40/);
    });
});

