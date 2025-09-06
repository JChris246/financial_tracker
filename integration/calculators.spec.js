// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test("has title", async ({ page }) => {
    await pageSetup({ page, pathname: "/calculators" });

    await expect(page.locator("[data-test-id=\"header-title\"]")).toHaveText(/Finance Tracker/);
});

test.describe("compound interest calculator", () => {
    test("should allow calculating compound interest with all fields filled", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-deposit").fill("10000");
        await page.locator("#incremental-amount").fill("800");
        await page.locator("#period").fill("60");
        await page.locator("#rate").fill("2.95");
        await page.locator("#payment-frequency").selectOption({ value: "annually" });

        await page.locator("#calculate-compound").click();

        await page.locator("#compound-interest-table-tab").click();
        const historyTable = page.locator("#compound-interest-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(6);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("10,295.00");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("15,007.70");
    });

    test("should allow calculating compound interest with deposit missing", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#incremental-amount").fill("450");
        await page.locator("#period").fill("24");
        await page.locator("#rate").fill("0.016");
        await page.locator("#payment-frequency").selectOption({ value: "monthly" });

        await page.locator("#calculate-compound").click();

        await page.locator("#compound-interest-table-tab").click();
        const historyTable = page.locator("#compound-interest-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(25);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("0.00");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("10,369.90");
    });

    test("should allow calculating compound interest with contribution missing", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-deposit").fill("10000");
        await page.locator("#period").fill("24");
        await page.locator("#rate").fill("0.16");
        await page.locator("#payment-frequency").selectOption({ value: "quarterly" });

        await page.locator("#calculate-compound").click();

        await page.locator("#compound-interest-table-tab").click();
        const historyTable = page.locator("#compound-interest-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(9);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("10,016.00");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("10,128.72");
    });
});

test.describe("stock dividend calculator", () => {
    test("should allow calculating dividends with initial deposit as USD and setting symbol instead of price", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-deposit-stock").fill("10000");
        await page.locator("#stock-symbol").fill("MSFT");
        await page.locator("#div-rate").fill("0.83");
        await page.locator("#incremental-stock-amount").fill("4000");
        await page.locator("#period-stock").fill("48");
        await page.locator("#dividend-frequency").selectOption({ value: "quarterly" });

        await page.locator("#calculate-compound-stock").click();

        await page.locator("#dividend-table-tab").click();
        const historyTable = page.locator("#dividend-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(17);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("10,016.64");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("71,074.45");
    });

    test("should allow calculating dividends with initial deposit as USD and setting price instead of symbol", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-deposit-stock").fill("10000");
        await page.locator("#stock-price").fill("502");
        await page.locator("#div-rate").fill("0.83");
        await page.locator("#incremental-stock-amount").fill("4000");
        await page.locator("#period-stock").fill("48");
        await page.locator("#dividend-frequency").selectOption({ value: "quarterly" });

        await page.locator("#calculate-compound-stock").click();

        await page.locator("#dividend-table-tab").click();
        const historyTable = page.locator("#dividend-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(17);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("10,016.53");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("71,067.63");
    });

    test("should allow calculating dividends with initial deposit as shares and setting price instead of symbol", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-shares").fill("20");
        await page.locator("#stock-symbol").fill("MSFT");
        await page.locator("#div-rate").fill("0.83");
        await page.locator("#incremental-stock-amount").fill("4000");
        await page.locator("#period-stock").fill("48");
        await page.locator("#dividend-frequency").selectOption({ value: "quarterly" });

        await page.locator("#calculate-compound-stock").click();

        await page.locator("#dividend-table-tab").click();
        const historyTable = page.locator("#dividend-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(17);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("9,993.40");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("71,050.63");
    });

    test("should allow calculating dividends with initial deposit as shares and setting symbol instead of price", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-shares").fill("20");
        await page.locator("#stock-price").fill("502");
        await page.locator("#div-rate").fill("0.83");
        await page.locator("#incremental-stock-amount").fill("4000");
        await page.locator("#period-stock").fill("48");
        await page.locator("#dividend-frequency").selectOption({ value: "quarterly" });

        await page.locator("#calculate-compound-stock").click();

        await page.locator("#dividend-table-tab").click();
        const historyTable = page.locator("#dividend-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(17);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("10,056.60");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("71,108.70");
    });

    test("should allow calculating dividends with contribution missing", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#initial-deposit-stock").fill("10000");
        await page.locator("#stock-price").fill("57.05");
        await page.locator("#div-rate").fill("0.27");
        await page.locator("#period-stock").fill("24");
        await page.locator("#dividend-frequency").selectOption({ value: "monthly" });

        await page.locator("#calculate-compound-stock").click();

        await page.locator("#dividend-table-tab").click();
        const historyTable = page.locator("#dividend-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(25);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("10,047.33");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("11,199.87");
    });
});