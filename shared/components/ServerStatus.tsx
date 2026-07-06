// shared/components/ServerStatus.tsx
import { useGetApiHealth } from "@/shared/generated/health/health"
import { useEffect, useState } from "react"
import { backendUrlStorage } from "@/shared/customFetcher"

export function ServerStatus() {
  const [backendUrl, setBackendUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAndWatchBackendUrl = async () => {
      try {
        const url = await backendUrlStorage.getValue()
        console.log("Initial backend URL:", url)
        setBackendUrl(url || "")
        setIsLoading(false)

        const unwatch = storage.watch<string>("local:backendUrl", (newUrl, oldUrl) => {
          console.log("Backend URL changed from", oldUrl, "to", newUrl)
          setBackendUrl(newUrl || "")
        })

        return unwatch
      } catch (error) {
        console.error("Failed to load backend URL:", error)
        setIsLoading(false)
      }
    }

    let cleanup: (() => void) | undefined

    loadAndWatchBackendUrl().then((unwatchFn) => {
      if (unwatchFn) cleanup = unwatchFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  const {
    data,
    refetch,
    isLoading: queryLoading,
    error,
    isError,
  } = useGetApiHealth({
    query: {
      refetchInterval: 3000,
      enabled: !!backendUrl && !isLoading,
      retry: 3,
      retryDelay: 1000,
      gcTime: 0,
      staleTime: 0,
      placeholderData: undefined,
    },
  })
  console.log(data, "healthy?", backendUrl, error, isError)

  useEffect(() => {
    if (backendUrl && !isLoading) {
      console.log("Backend URL changed, refetching health...")
      refetch()
    }
  }, [backendUrl, isLoading, refetch])

  console.log("ServerStatus state:", {
    backendUrl,
    isLoading,
    queryLoading,
    dataStatus: data?.status,
    error,
  })

  return (
    isError && (
      <div className="fixed bottom-5 left-0 right-0 bg-[#FF5151] text-black text-center z-50 animate-fadeIn text-sm py-2">
        Backend offline - Please check your server connection
      </div>
    )
  )
}
