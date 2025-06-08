/** @type {import('jest').Config} */
const config = {
    verbose: true,
    testPathIgnorePatterns: [
        "/node_modules/",
        "/integration/"
    ]
};

export default config;