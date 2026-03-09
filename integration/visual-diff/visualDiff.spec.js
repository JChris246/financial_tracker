import { test } from "@playwright/test";

import { pageSetup } from "../setup";
const dirname = import.meta.dirname;

const homePage = async ({ page }) => {
    await pageSetup({ page, pathname: "/" });

    return {
        page, name: "empty-home-page"
    }
};

const scenarios = [
    homePage
];

test("capture screenshots", async ({ page }, workerInfo) => {
    const projectName = workerInfo.project.name;

    for (let i = 0; i < scenarios.length; i++) {
        const { page: processedPage, name } = await scenarios[i]({ page });

        await processedPage.screenshot({ fullPage: true, path: dirname + "/screenshots/" + name + "_" + projectName + ".png" });
    }
});