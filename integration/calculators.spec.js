// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";
import { addTransaction, formatInputDate } from "./helpers";

test.afterEach(async () => {
    // TODO: if this were running as an "integration" test, we'd need to not run this (or mock it)
    await fetch("http://localhost:5000/api/admin/wipeDb"); // TODO: extract url
});

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

test.describe("amortization calculator", () => {
    test("should allow calculating amortization with a deposit", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#amortization-price").fill("100000");
        await page.locator("#amortization-deposit").fill("30000");
        await page.locator("#amortization-period").fill("48");
        await page.locator("#amortization-rate").fill("8");

        await page.locator("#calculate-amortization").click();

        await expect(page.locator("#risk-text")).toBeHidden(); // no income, so no risk text
        await expect(page.locator("#total-total-paid")).toHaveText("$112,027.42");

        await page.locator("#amortization-table-tab").click();
        const historyTable = page.locator("#amortization-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(49);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("68,757.76");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("0.00");
    });

    test("should allow calculating amortization without a deposit", async ({ page }) => {
        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#amortization-price").fill("100000");
        await page.locator("#amortization-period").fill("48");
        await page.locator("#amortization-rate").fill("8");

        await page.locator("#calculate-amortization").click();

        await expect(page.locator("#risk-text")).toBeHidden(); // no income, so no risk text
        await expect(page.locator("#total-total-paid")).toHaveText("$117,182.03");

        await page.locator("#amortization-table-tab").click();
        const historyTable = page.locator("#amortization-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(49);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("98,225.37");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("0.00");
    });

    test("should allow calculating amortization with a deposit and showing risk text as aggressive", async ({ page }) => {
        await pageSetup({ page });

        const now = new Date().getTime();
        const dateAgo1 = new Date(now - 1000 * 60 * 60 * 24 * 30); // 1 month ago
        const dateAgo2 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 2); // 2 month ago
        const dateAgo3 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 3); // 3 month ago

        await addTransaction(page, "5200", "cash", "usd", formatInputDate(new Date(now)), "Income 1");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo1), "Income 2");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo2), "Income 3");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo3), "Income 4");

        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#amortization-price").fill("100000");
        await page.locator("#amortization-deposit").fill("30000");
        await page.locator("#amortization-period").fill("48");
        await page.locator("#amortization-rate").fill("8");

        await page.locator("#calculate-amortization").click();

        await expect(page.locator("#risk-text")).toBeVisible();
        await expect(page.locator("#risk-text")).toHaveText("Aggressive");
        await expect(page.locator("#total-total-paid")).toHaveText("$112,027.42");

        await page.locator("#amortization-table-tab").click();
        const historyTable = page.locator("#amortization-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(49);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("68,757.76");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("0.00");
    });

    test("should allow calculating amortization with a deposit and showing risk text as safe", async ({ page }) => {
        await pageSetup({ page });

        const now = new Date().getTime();
        const dateAgo1 = new Date(now - 1000 * 60 * 60 * 24 * 30); // 1 month ago
        const dateAgo2 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 2); // 2 month ago
        const dateAgo3 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 3); // 3 month ago

        await addTransaction(page, "5200", "cash", "usd", formatInputDate(new Date(now)), "Income 1");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo1), "Income 2");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo2), "Income 3");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo3), "Income 4");

        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#amortization-price").fill("50000");
        await page.locator("#amortization-deposit").fill("25000");
        await page.locator("#amortization-period").fill("48");
        await page.locator("#amortization-rate").fill("8");

        await page.locator("#calculate-amortization").click();

        await expect(page.locator("#risk-text")).toBeVisible();
        await expect(page.locator("#risk-text")).toHaveText("Safe");
        await expect(page.locator("#total-total-paid")).toHaveText("$54,295.51");

        await page.locator("#amortization-table-tab").click();
        const historyTable = page.locator("#amortization-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(49);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("24,556.34");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("0.00");
    });

    test("should allow calculating amortization with a deposit and showing risk text as comfortable", async ({ page }) => {
        await pageSetup({ page });

        const now = new Date().getTime();
        const dateAgo1 = new Date(now - 1000 * 60 * 60 * 24 * 30); // 1 month ago
        const dateAgo2 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 2); // 2 month ago
        const dateAgo3 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 3); // 3 month ago

        await addTransaction(page, "5200", "cash", "usd", formatInputDate(new Date(now)), "Income 1");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo1), "Income 2");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo2), "Income 3");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo3), "Income 4");

        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#amortization-price").fill("50000");
        await page.locator("#amortization-deposit").fill("20000");
        await page.locator("#amortization-period").fill("48");
        await page.locator("#amortization-rate").fill("8");

        await page.locator("#calculate-amortization").click();

        await expect(page.locator("#risk-text")).toBeVisible();
        await expect(page.locator("#risk-text")).toHaveText("Comfortable");
        await expect(page.locator("#total-total-paid")).toHaveText("$55,154.61");

        await page.locator("#amortization-table-tab").click();
        const historyTable = page.locator("#amortization-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(49);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("29,467.61");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("0.00");
    });

    test("should allow calculating amortization with a deposit and showing risk text as stretch", async ({ page }) => {
        await pageSetup({ page });

        const now = new Date().getTime();
        const dateAgo1 = new Date(now - 1000 * 60 * 60 * 24 * 30); // 1 month ago
        const dateAgo2 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 2); // 2 month ago
        const dateAgo3 = new Date(now - 1000 * 60 * 60 * 24 * 30 * 3); // 3 month ago

        await addTransaction(page, "5200", "cash", "usd", formatInputDate(new Date(now)), "Income 1");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo1), "Income 2");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo2), "Income 3");
        await addTransaction(page, "5200", "cash", "usd", formatInputDate(dateAgo3), "Income 4");

        await pageSetup({ page, pathname: "/calculators" });

        await page.locator("#amortization-price").fill("70000");
        await page.locator("#amortization-deposit").fill("25000");
        await page.locator("#amortization-period").fill("60");
        await page.locator("#amortization-rate").fill("8");

        await page.locator("#calculate-amortization").click();

        await expect(page.locator("#risk-text")).toBeVisible();
        await expect(page.locator("#risk-text")).toHaveText("Stretch");
        await expect(page.locator("#total-total-paid")).toHaveText("$79,746.26");

        await page.locator("#amortization-table-tab").click();
        const historyTable = page.locator("#amortization-table");
        await expect(historyTable).toBeVisible();

        await expect(historyTable.locator("tr")).toHaveCount(61);
        await expect(historyTable.locator("tr").nth(1).locator("td").last()).toHaveText("44,387.56");
        await expect(historyTable.locator("tr").last().locator("td").last()).toHaveText("0.00");
    });
});