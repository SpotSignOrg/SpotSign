module.exports = {
  parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:promise/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
    project: "./tsconfig.json"
  },
  ignorePatterns: ["webpack.config.js", "node_modules/", "icons/", "manifest.json", "*.html"],
  rules: {
    "eslint(@typescript-eslint/camelcase)": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "promise/prefer-await-to-then": "error",
    "promise/prefer-await-to-callbacks": "error",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  settings: {
    "react": {
      "pragma": "React",
      "version": "detect"
    }
  },
  plugins: ["promise", "react-hooks"]
};  
