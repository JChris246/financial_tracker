// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";
import * as fs from "fs";

test.afterEach(async () => {
    // TODO: if this were running as an "integration" test, we'd need to not run this (or mock it)
    await fetch("http://localhost:5000/api/admin/wipeDb"); // TODO: extract url
});

test("has title", async ({ page }) => {
    await pageSetup({ page, pathname: "/history" });

    await expect(page.locator("[data-test-id=\"header-title\"]")).toHaveText(/Finance Tracker/);
});

// TODO: extract to helper?
const addTransaction = async (page, value, assetType="cash", currency="eur", date, name="Test Transaction") => {
    const addTransactionButton = page.locator("#add-transaction-button");

    await addTransactionButton.click();
    await page.locator("#transaction-name").fill(name);
    await page.locator("#transaction-amount").fill(value);
    await page.locator("#transaction-category").selectOption({ value: "other" });
    await page.locator("#transaction-asset-type").selectOption({ value: assetType });
    await page.locator("#transaction-currency").selectOption({ value: currency });
    if (date) {
        await page.locator("#transaction-date").fill(date);
    }
    await page.locator("#submit-transaction").click();
};

test.describe("transaction history", () => {
    test("transaction history page should contain no items if no transactions", async ({ page }) => {
        await pageSetup({ page, pathname:"/history" });

        await expect(page.locator("#no-transactions-found")).toBeVisible();
        await expect(page.locator("#no-transactions-found")).toHaveText("No transactions found.");
    });

    test("transaction history page should contain the appropriate number of items based transactions", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC");
        await addTransaction(page, "-50", "crypto", "ETH");
        await addTransaction(page, "-20", "crypto", "ADA");
        await addTransaction(page, "10");
        await addTransaction(page, "50");

        await pageSetup({ page, pathname:"/history" });

        await expect(page.locator("tr")).toHaveCount(7);
    });

    test("transaction history page should contain the transactions sorted with the most recent first", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09");
        await addTransaction(page, "-40", "crypto", "ETH", "2023-01-07T23:43:09");
        await addTransaction(page, "-80", "crypto", "ADA", "2024-01-07T23:43:09");
        await addTransaction(page, "10", "cash", "eur", "2025-01-07T23:43:09");
        await addTransaction(page, "-50", "cash", "usd", "2025-02-07T23:43:09");
        await addTransaction(page, "-20", "cash", "cad", "2025-02-08T23:43:09");

        await pageSetup({ page, pathname:"/history" });
        const items = page.locator("tr");

        // first item in the table should be the most recent
        await expect(items.nth(2).locator("#transaction-history-amount-0")).toHaveText(/-\s*20\.00/);

        // last item in the table should be the oldest
        await expect(items.last().locator("#transaction-history-amount-5")).toHaveText(/\s*10/);
    });

    test("transaction history page should allow filtering", async ({ page }) => {
        await pageSetup({ page });

        await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09", "Test Transaction 1");
        await addTransaction(page, "-40", "crypto", "ETH", "2023-01-07T23:43:09", "Deposit");
        await addTransaction(page, "-80", "crypto", "ADA", "2024-01-07T23:43:09", "Credit Dividend");
        await addTransaction(page, "10", "cash", "eur", "2025-01-07T23:43:09", "Credit Card Payment");
        await addTransaction(page, "-50", "cash", "usd", "2025-02-07T23:43:09", "Withdrawal");
        await addTransaction(page, "-20", "cash", "cad", "2025-02-08T23:43:09", "Test Transaction 2");

        await pageSetup({ page, pathname:"/history" });
        await expect(page.locator("tr")).toHaveCount(8);

        const nameFilter = page.locator("input[name=name]");
        await nameFilter.fill("Depo");
        await expect(page.locator("tr")).toHaveCount(3);

        await nameFilter.clear();
        await expect(page.locator("tr")).toHaveCount(8);

        nameFilter.fill("credit");
        await expect(page.locator("tr")).toHaveCount(4);

        const dateFilter = page.locator("input[name=date]");
        dateFilter.fill("2025");

        await expect(page.locator("tr")).toHaveCount(3);
    });

    test.describe("export", () => {
        test("should allow exporting transactions as csv", async ({ page }) => {
            await pageSetup({ page });

            await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09");
            await addTransaction(page, "-50", "crypto", "ETH", "2023-01-07T23:43:09");
            await addTransaction(page, "-20", "crypto", "ADA", "2024-01-08T23:43:09");

            await pageSetup({ page, pathname:"/history" });

            const exportButton = page.locator("#export-btn");
            await exportButton.click();

            const downloadPromise = page.waitForEvent("download");
            const exportCsvButton = page.locator("button[name=\"csv\"]");
            await exportCsvButton.click();

            const download = await downloadPromise;
            const savedFileName = "./downloaded/" + download.suggestedFilename();
            await download.saveAs(savedFileName);

            expect(fs.existsSync(savedFileName)).toBe(true);
            const contents = fs.readFileSync(savedFileName).toString();
            expect(contents).toEqual("Name,Amount,Date,Category,Asset Type,Currency\n" +
                                     "Test Transaction,10,2022-01-07 23:43,other,crypto,BTC\n" +
                                     "Test Transaction,-50,2023-01-07 23:43,other,crypto,ETH\n" +
                                     "Test Transaction,-20,2024-01-08 23:43,other,crypto,ADA");
            fs.unlinkSync(savedFileName);
        })

        test("should allow exporting transactions as md", async ({ page }) => {
            await pageSetup({ page });

            await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09");
            await addTransaction(page, "-50", "crypto", "ETH", "2023-01-07T23:43:09");
            await addTransaction(page, "-20", "crypto", "ADA", "2024-01-08T23:43:09");

            await pageSetup({ page, pathname:"/history" });

            const exportButton = page.locator("#export-btn");
            await exportButton.click();

            const downloadPromise = page.waitForEvent("download");
            const exportCsvButton = page.locator("button[name=\"md\"]");
            await exportCsvButton.click();

            const download = await downloadPromise;
            const savedFileName = "./downloaded/" + download.suggestedFilename();
            await download.saveAs(savedFileName);

            expect(fs.existsSync(savedFileName)).toBe(true);
            const contents = fs.readFileSync(savedFileName).toString();
            expect(contents).toEqual("| Name             | Amount | Date             | Category | Asset Type | Currency |\n" +
                                     "| ---------------- | ------ | ---------------- | -------- | ---------- | -------- |\n" +
                                     "| Test Transaction | 10     | 2022-01-07 23:43 | other    | crypto     | BTC      |\n" +
                                     "| Test Transaction | -50    | 2023-01-07 23:43 | other    | crypto     | ETH      |\n" +
                                     "| Test Transaction | -20    | 2024-01-08 23:43 | other    | crypto     | ADA      |");
            fs.unlinkSync(savedFileName);
        })

        test("should allow exporting transactions as json", async ({ page }) => {
            await pageSetup({ page });

            await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09");
            await addTransaction(page, "-50", "crypto", "ETH", "2023-01-07T23:43:09");
            await addTransaction(page, "-20", "crypto", "ADA", "2024-01-08T23:43:09");

            await pageSetup({ page, pathname:"/history" });

            const exportButton = page.locator("#export-btn");
            await exportButton.click();

            const downloadPromise = page.waitForEvent("download");
            const exportCsvButton = page.locator("button[name=\"json\"]");
            await exportCsvButton.click();

            const download = await downloadPromise;
            const savedFileName = "./downloaded/" + download.suggestedFilename();
            await download.saveAs(savedFileName);

            expect(fs.existsSync(savedFileName)).toBe(true);
            // @ts-ignore
            const contents = JSON.parse(fs.readFileSync(savedFileName));
            expect(contents).toEqual([
                {"name":"Test Transaction","date":1641613389000,"amount":10,"category":"other","assetType":"crypto","currency":"BTC"},
                {"name":"Test Transaction","date":1673149389000,"amount":-50,"category":"other","assetType":"crypto","currency":"ETH"},
                {"name":"Test Transaction","date":1704771789000,"amount":-20,"category":"other","assetType":"crypto","currency":"ADA"}
            ]);
            fs.unlinkSync(savedFileName);
        })
    });

    test.describe("delete transactions", () => {
        test("should allow deleting transactions from the list", async ({ page }) => {
            await pageSetup({ page });

            await addTransaction(page, "10", "crypto", "BTC", "2022-01-07T23:43:09");
            await addTransaction(page, "-50", "crypto", "ETH", "2023-01-07T23:43:09");
            await addTransaction(page, "-20", "crypto", "ADA", "2024-01-08T23:43:09");

            await pageSetup({ page, pathname:"/history" });

            const trs = page.locator("tr");
            await expect(trs).toHaveCount(5); // 3 transactions + 2 header rows

            const deleteModal = page.locator("#deleteTransactionModal");
            await expect(deleteModal).toBeHidden();
            await trs.last().locator("button[name=\"delete-transaction\"]").click();
            await expect(deleteModal).toBeVisible();

            await page.locator("#confirm-delete-transaction").click();
            await expect(deleteModal).toBeHidden();

            await expect(trs).toHaveCount(4); // 2 transactions + 2 header rows
        })
    });
});