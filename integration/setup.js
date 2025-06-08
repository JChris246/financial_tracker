export const baseUrl = "http://localhost:5173"; // dynamically plug into what vite starts up with?

export const pageSetup = async ({ pathname, page, routes=[], refererPath=undefined }) => {

    // for integration test, setup routes to return mock api responses
    // TODO: for e2e tests, use the real api? probably don't need this for e2e
    for (const route of routes) {
        await page.route(route.url, route.response);
    }

    // TODO: config shared error handling

    const referer = refererPath ? new URL(refererPath, baseUrl).href : undefined;
    await page.goto(pathname, { referer });

    await Promise.all([
        page.waitForLoadState("networkidle"),
        page.waitForLoadState("domcontentloaded"),
    ])
};