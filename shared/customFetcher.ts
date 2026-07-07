export const backendUrlStorage = storage.defineItem<string>("local:backendUrl", {
  fallback: import.meta.env.VITE_BACKEND_SERVER ?? "",
})

export const customFetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const baseUrl = await backendUrlStorage.getValue()

  if (!baseUrl || baseUrl === "") {
    throw new Error("Backend URL not configured. Please set it in the extension settings.")
  }

  // Ensure baseUrl doesn't end with / and url starts with /
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = url.startsWith("/") ? url : `/${url}`
  const finalUrl = `${normalizedBaseUrl}${normalizedPath}`

  // console.log(finalUrl, "final URL")

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
  }

  try {
    const response = await fetch(finalUrl, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    clearTimeout(timeoutId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).name === "AbortError") {
      throw new Error("Request timeout - backend not responding")
    }

    if (error instanceof Error) {
      throw new Error(error.message + ", happened in customFetcher '\n'")
    }

    throw new Error("Unknown network error occurred")
  }
}
