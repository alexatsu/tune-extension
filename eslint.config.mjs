// @ts-check

import js from "@eslint/js"
import eslint from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"
import queryPlugin from "@tanstack/eslint-plugin-query"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"

export default defineConfig(
  js.configs.recommended,
  eslint.configs.recommended,
  tseslint.configs.recommended,
  queryPlugin.configs["flat/recommended"],
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    ignores: [".output", ".wxt"],
    rules: {
      "set-state-in-effect": [0],
    },
  },
)
