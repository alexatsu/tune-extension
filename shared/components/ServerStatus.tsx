import { getGetApiHealthQueryKey } from "@/shared/generated/health/health"
import { useState, useEffect } from "react"

export function ServerStatus() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(getGetApiHealthQueryKey()[0], {
          signal: AbortSignal.timeout(2000),
        })

        if (!response.ok) throw new Error("Failed")

        const data = await response.json()

        if (data.status === "ok") {
          setIsOffline(false)
        }
      } catch {
        setIsOffline(true)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-5 left-0 right-0 bg-[#FF5151] text-black text-center z-50 animate-fadeIn text-sm">
      Backend offline
    </div>
  )
}
