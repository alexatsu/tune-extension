import { defineConfig } from "orval"

const baseUrl = "http://192.168.1.128:8080"
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
      baseUrl,
      headers: false,
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
        fetch: {
          includeHttpResponseReturnType: false,
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
