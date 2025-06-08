// @ts-check
import { defineConfig, devices } from '@playwright/test';

import { baseUrl } from "./setup";

// TODO: have separate config for e2e? probably not
/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: ".",
    testMatch: '*.spec.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI, // TODO: set this var when setting up CI tests
    workers: process.env.CI ? 1 : "50%",
    timeout: 15 * 1000, // 15 seconds, maximum time for each test (the expect() assertions)
    reporter: 'html',
    use: {
        ignoreHTTPSErrors: true,
        actionTimeout: 5 * 1000,
        baseURL: baseUrl,
        video: 'on', // TODO: maybe turn this off in CI
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    webServer: {
        command: 'npm run dev',
        url: baseUrl,
        reuseExistingServer: !process.env.CI,
        cwd: "../client"
    },
});