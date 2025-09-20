// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";
import { addTransaction } from "./helpers";

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

test.describe("add transaction", () => {
    test("should allow user to add a transaction with a custom category", async ({ page }) => {
        await pageSetup({ page });

        const addTransactionButton = page.locator("#add-transaction-button");
        await addTransactionButton.click();

        await page.locator("#transaction-name").fill("Test Transaction");
        await page.locator("#transaction-amount").fill("12");
        await page.locator("#transaction-category").selectOption({ value: "add custom" });
        await page.locator("#transaction-category").fill("Leisure");
        await page.locator("#transaction-asset-type").selectOption({ value: "cash" });
        await page.locator("#transaction-currency").selectOption({ value: "usd" });
        await page.locator("#submit-transaction").click();

        await expect(page.locator("#transaction-history-list > *")).toHaveCount(1);
    });
});


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

test.describe("transaction history glance", () => {
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

test.describe("at a glance prices", () => {
    test("at a glance price should be displayed; there should be 10 items, with key and value", async ({ page }) => {
        await pageSetup({ page });

        const items = page.locator("[glance-price]");
        await expect(items).toHaveCount(10);

        for (let i = 0; i < 10; i++) {
            await expect(items.nth(i).locator("span").nth(0)).toHaveText(/[A-Z]+/);
            await expect(items.nth(i).locator("span").nth(1)).toHaveText(/\$\s*[\d,]+\.\d{2}/)
        }
    })
});

test.describe("import transactions", () => {
    test("should allow user to add transactions from csv", async ({ page }) => {
        await pageSetup({ page });

        // since I need to set the file on the input itself in testing, I don't think I need to click the import button
        const importTransactionsButton = page.locator("#add-transactions-button");
        await importTransactionsButton.click();

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./transactions.csv");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(7);

        // submit the transactions and check transaction history list and balance
        await page.locator("#submit-transactions").click();
        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
        await expect(page.locator("#balance-value")).toHaveText(/\$\s*4,497\.74/);
    })

    test("should allow user to add transactions from csv with blank rows", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./transactionsWithBlankRecords.csv");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(7);

        // submit the transactions and check transaction history list and balance
        await page.locator("#submit-transactions").click();
        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
        await expect(page.locator("#balance-value")).toHaveText(/\$\s*4,497\.74/);
    })

    test("should not allow user to click upload button if errors not fixed from csv", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./bad_transactions.csv");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(8);

        // expect the upload button to be disabled since csv had errors
        await expect(page.locator("#submit-transactions")).toBeDisabled();
    });

    test("should allow user to click upload button after making changes to the appropriate rows (csv import)", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./bad_transactions.csv");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(8);

        // expect the upload button to be disabled since csv had errors
        await expect(page.locator("#submit-transactions")).toBeDisabled();

        const rows = page.locator("tr");
        await rows.nth(7).locator("input[name=name]").fill("Test Transaction");

        // the button should now be enabled
        await expect(page.locator("#submit-transactions")).toBeEnabled();

        // submit the transactions and check transaction history list and balance
        await page.locator("#submit-transactions").click();
        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
        await expect(page.locator("#balance-value")).toHaveText(/\$\s*4,507[.]83/);
    });

    test("should allow user to add transactions from md", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./transactions.md");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(7);

        // submit the transactions and check transaction history list and balance
        await page.locator("#submit-transactions").click();
        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
        await expect(page.locator("#balance-value")).toHaveText(/\$\s*4,497\.74/);
    })

    test("should allow user to add transactions from md with blank rows", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./transactionsWithBlankRecords.md");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(7);

        // submit the transactions and check transaction history list and balance
        await page.locator("#submit-transactions").click();
        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
        await expect(page.locator("#balance-value")).toHaveText(/\$\s*4,497\.74/);
    })

    test("should not allow user to click upload button if errors not fixed from md", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./bad_transactions.md");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(8);

        // expect the upload button to be disabled since csv had errors
        await expect(page.locator("#submit-transactions")).toBeDisabled();
    });

    test("should allow user to click upload button after making changes to the appropriate rows (md import)", async ({ page }) => {
        await pageSetup({ page });

        const fileInput = page.locator("#transactions-file-input");
        await fileInput.setInputFiles("./bad_transactions.md");

        // basic verification, that the file was processed and loaded in the modal
        await expect(page.locator("#review-transactions-modal")).toBeVisible();
        await expect(page.locator("tr")).toHaveCount(8);

        // expect the upload button to be disabled since csv had errors
        await expect(page.locator("#submit-transactions")).toBeDisabled();

        const rows = page.locator("tr");
        await rows.nth(7).locator("input[name=name]").fill("Test Transaction");

        // the button should now be enabled
        await expect(page.locator("#submit-transactions")).toBeEnabled();

        // submit the transactions and check transaction history list and balance
        await page.locator("#submit-transactions").click();
        await expect(page.locator("#transaction-history-list > *")).toHaveCount(5);
        await expect(page.locator("#balance-value")).toHaveText(/\$\s*4,507[.]83/);
    });
});