// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.afterEach(async () => {
    // TODO: if this were running as an "integration" test, we'd need to not run this (or mock it)
    await fetch("http://localhost:5000/api/admin/wipeDb"); // TODO: extract url
});

test("has title", async ({ page }) => {
    const routes = [
        { url: "**/api/transactions/income", response: [], status: 200 },
        { url: "**/api/transactions/spend", response: [], status: 200 },
        { url: "*/**/api/balance", response: {
            balance: 12, crypto: {}, stock: {}, cash: {}, totalIncome: 0, totalSpend: 0
        }, status: 200 }
    ];
    await pageSetup({ page, routes });

    await expect(page.locator("[data-test-id=\"header-title\"]")).toHaveText(/Finance Tracker/);
});

const addTransaction = async (page, value, assetType="cash", currency="eur", date) => {
    const addTransactionButton = await page.locator("#add-transaction-button");

    await addTransactionButton.click();
    await page.locator("#transaction-name").fill("Test Transaction"); // Increment a count for this?
    await page.locator("#transaction-amount").fill(value);
    await page.locator("#transaction-category").selectOption({ value: "other" });
    await page.locator("#transaction-asset-type").selectOption({ value: assetType });
    await page.locator("#transaction-currency").selectOption({ value: currency });
    if (date) {
        await page.locator("#transaction-date").fill(date);
    }
    await page.locator("#submit-transaction").click();
};


test.describe("balance section", () => {
    test("has balance as 0 if no transactions", async ({ page }) => {
        await pageSetup({ page });

        await expect(page.locator("#balance-value")).toHaveText(/\$\s*0\.00/);
    });

    test("has balance correct balance based on transaction history", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10");
        await addTransaction(page, "50");
        await addTransaction(page, "-20");

        await expect(page.locator("#balance-value")).toHaveText(/\$\s*46[.]22/);
    });
});

test.describe("index cards", () => {
    test("all cards balance as 0 if no transactions", async ({ page }) => {
        await pageSetup({ page });

        const ids = ["Income", "Expense", "Crypto", "Stock"];
        for (const idPrefix of ids) {
            const id = "#" + idPrefix + "-value";
            await expect(page.locator(id)).toHaveText(/(?:\$|₿)\s*0\.00/);
        }
    });

    test("income card has balance correct balance based on transaction history", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10");
        await addTransaction(page, "50");
        await addTransaction(page, "-20");

        await expect(page.locator("#Income-value")).toHaveText(/\$\s*69\.33/);
    });

    test("expense card has balance correct balance based on transaction history", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10");
        await addTransaction(page, "-50");
        await addTransaction(page, "-20");

        await expect(page.locator("#Expense-value")).toHaveText(/\$\s*80\.89/);
    });

    test("crypto card has balance correct balance based on transaction history", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC");
        await addTransaction(page, "-50", "crypto", "ETH");
        await addTransaction(page, "-20", "crypto", "ADA");

        await expect(page.locator("#Crypto-value")).toHaveText(/\₿\s*951,394[.]13/);
    });

    test("stock card has balance correct balance based on transaction history", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "stock", "AAPL");
        await addTransaction(page, "-2", "stock", "AAPL");
        await addTransaction(page, "50", "stock", "NVDA");

        await expect(page.locator("#Stock-value")).toHaveText(/\$\s*9,675\.40/);
    });
});

test.describe("transaction history", () => {
    test("transaction section should contain no items if no transactions", async ({ page }) => {
        await pageSetup({ page });

        await expect(page.locator("#transaction-history-list > *")).toHaveCount(0);
    });

    test("transaction section should contain the appropriate number of items based transactions", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC");
        await addTransaction(page, "-50", "crypto", "ETH");
        await addTransaction(page, "-20", "crypto", "ADA");
        await addTransaction(page, "10");
        await addTransaction(page, "50");

        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
    });

    test("transaction section should contain the max number of number of items when transactions exceed", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC");
        await addTransaction(page, "-50", "crypto", "ETH");
        await addTransaction(page, "-20", "crypto", "ADA");
        await addTransaction(page, "10");
        await addTransaction(page, "-50");
        await addTransaction(page, "-20");

        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
    });

    test("transaction section should contain the transactions sorted with the most recent first", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09");
        await addTransaction(page, "-40", "crypto", "ETH", "2023-01-07T23:43:09");
        await addTransaction(page, "-80", "crypto", "ADA", "2024-01-07T23:43:09");
        await addTransaction(page, "10", "cash", "eur", "2025-01-07T23:43:09");
        await addTransaction(page, "-50", "cash", "usd", "2025-02-07T23:43:09");
        await addTransaction(page, "-20", "cash", "cad", "2025-02-08T23:43:09");

        const items = page.locator("#transaction-history-list > *");

        await expect(items.first().locator("#transaction-history-amount-0")).toHaveText(/-\s*20\.00/);
        await expect(items.last().locator("#transaction-history-amount-4")).toHaveText(/-\s*40\.00/);
    });
});

