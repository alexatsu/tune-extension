// shared/components/Settings.tsx
import { backendUrlStorage } from "@/shared/customFetcher"
import { useState, useEffect } from "react"

export function Settings() {
  const [url, setUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Load current URL on mount
    const loadUrl = async () => {
      const currentUrl = await backendUrlStorage.getValue()
      console.log(currentUrl, 'here is the current url')
      if (currentUrl) {
        setUrl(currentUrl)
        setIsConfigured(true)
      }
    }
    loadUrl()
  }, [])

  const handleSave = async () => {
    if (!url.trim()) {
      setSaveStatus("error")
      return
    }

    setIsSaving(true)
    setSaveStatus("idle")

    try {
      // Validate URL format
      new URL(url) // Throws if invalid

      await backendUrlStorage.setValue(url.trim())
      setIsConfigured(true)
      setSaveStatus("success")

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      console.error("Failed to save URL:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm("Reset to default URL?")) {
      const defaultUrl = import.meta.env.VITE_BACKEND_SERVER || ""
      if (defaultUrl) {
        await backendUrlStorage.setValue(defaultUrl)
        setUrl(defaultUrl)
        setIsConfigured(true)
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-300">Backend Server URL</label>
        {isConfigured && <div>ok</div>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.your-backend.com/v1"
            className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-amber-50 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !url.trim()}
            className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
          >
            {isSaving ? <span>saving</span> : <span>save</span>}
            Save
          </button>
        </div>

        {/* Status messages */}
        {saveStatus === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-500">URL saved successfully!</div>
        )}

        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-sm text-red-500">Invalid URL or save failed</div>
        )}

        {/* Reset button (only show if default is available) */}
        {import.meta.env.VITE_BACKEND_SERVER && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors text-left"
          >
            Reset to default
          </button>
        )}
      </div>
    </div>
  )
}
