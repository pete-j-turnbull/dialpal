module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  ignorePatterns: [".eslintrc.cjs", "convex/_generated", "node_modules"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: true,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    // Only warn on unused variables, and ignore variables starting with `_`
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],

    // Await your promises
    "@typescript-eslint/no-floating-promises": "error",

    // Allow explicit `any`s
    "@typescript-eslint/no-explicit-any": "off",

    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

    // http://eslint.org/docs/rules/no-restricted-imports
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["*/_generated/server"],
            importNames: ["query", "mutation", "action"],
            message: "Use functions.ts for query, mutation, action",
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
