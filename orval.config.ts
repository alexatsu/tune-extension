import { defineConfig } from "orval"
import "dotenv/config"

const baseUrl = process.env.VITE_BACKEND_SERVER
const target = baseUrl + "/swagger/doc.json"

export default defineConfig({
  backend: {
    input: {
      target,
    },
    output: {
      mode: "tags-split",
      client: "react-query",
      target: "shared/generated",
      schemas: "shared/generated/schemas",
      mock: false,
      baseUrl: "",
      headers: false,
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "shared/customFetcher.ts",
          name: "customFetcher",
        },
      },
    },
  },
  backendZod: {
    input: {
      target,
    },
    output: {
      mode: "tags-split",
      client: "zod",
      target: "shared/generated",
      fileExtension: ".zod.ts",
    },
  },
})
