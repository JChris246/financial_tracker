import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"

export default [
    { ignores: ["dist"] },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "indent": [
                "error",
                4,
                { "SwitchCase": 1 }
            ],
            "linebreak-style": [
                "error",
                "unix"
            ],
             "quotes": [
                "error",
                "double"
            ],
            "semi": [
                "warn",
                "always"
            ],
             "no-dupe-keys": [
                0
            ],
            "no-empty": "error",
            "no-unreachable-loop": "error",
            "no-empty-function": "error",
            "no-useless-return": "error",
            "eqeqeq": ["error", "smart"],
            "array-bracket-spacing": ["error", "never"],
            "block-spacing": "error",
            "keyword-spacing": ["error", { "before": true, "after": true }],
            "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
            "arrow-spacing": "error",
            "comma-spacing": ["error", { "before": false, "after": true }],
            "object-curly-spacing": ["error", "always"]
        },
    },
]
