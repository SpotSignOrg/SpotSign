module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:promise/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    project: "./tsconfig.json",
  },
  ignorePatterns: ["webpack.config.js", "node_modules/", "icons/", "manifest.json", "*.html"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "eslint(@typescript-eslint/camelcase)": "off",
    "promise/prefer-await-to-callbacks": "error",
    "promise/prefer-await-to-then": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react/prop-types": "off",
    "prefer-arrow/prefer-arrow-functions": [
      "error",
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },
  plugins: ["promise", "react-hooks", "prefer-arrow"],
};
