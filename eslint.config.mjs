import typescriptEslint from "typescript-eslint";

export default [{
    ignores: [
        // legacy tree, deleted in B4
        "src/import-snippets/**",
        "src/import-statements/**",
        "src/model/**",
        "src/providers/**",
        "src/subscriptions/**",
        "src/utilities/**",
        "src/test/fixtures/**",
    ],
}, {
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint.plugin,
    },

    languageOptions: {
        parser: typescriptEslint.parser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/naming-convention": ["warn", {
            selector: "import",
            format: ["camelCase", "PascalCase"],
        }],

        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
    },
}];