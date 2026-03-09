// @ts-check
import { defineConfig, devices } from '@playwright/test';

import { baseUrl } from "./setup";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "visual-diff/",
    testMatch: '*.spec.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI, // TODO: set this var when setting up CI tests
    workers: 1, // avoid concurrent tests since the db needs to be reset after each test
    timeout: 15 * 1000, // 15 seconds, maximum time for each test (the expect() assertions)
    reporter: 'html',
    use: {
        ignoreHTTPSErrors: true,
        actionTimeout: 5 * 1000,
        baseURL: baseUrl,
        video: !!process.env.CI ? "off" : "on",
        trace: 'on'
    },

    /* Configure projects for major browsers */
    // TODO: configure for mobile vs desktop
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: {
                ...{
                    ...devices['Desktop Firefox'],
                    viewport: {
                        width: 2560,
                        height: 1440
                    }
                }
            },
        },
        // using specific device type may not age well...
        {
            name: 'phone',
            use: {
                ...{
                    ...devices['Galaxy S24'],
                    viewport: {
                        width: 412,
                        height: 915
                    }
                }
            },
        },
        {
            name: 'tablet',
            use: { ...devices['iPad Pro 11'] },
        }
    ],

    // TODO: should e2e tests be run like this, or with the "final product" of the server hosting the client?
    webServer: [
        {
            name: 'server',
            command: 'npm run test:server',
            url: "http://localhost:5000",
            reuseExistingServer: !process.env.CI,
            cwd: "../server"
        },
        {
            name: 'client',
            command: 'npm run dev',
            url: baseUrl,
            reuseExistingServer: !process.env.CI,
            cwd: "../client"
        }
    ]
});