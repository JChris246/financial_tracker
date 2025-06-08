// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test("has title", async ({ page }) => {
    await pageSetup({ page, pathname: "", routes: [] });

    await expect(page.locator("[data-test-id=\"header-title\"]")).toHaveText(/Finance Tracker/);
});
