// App.tsx
import { Providers, useDetectProvider } from "@/shared/hooks/useDetectProvider"
import { YoutubeProvider } from "@/shared/components/YoutubeProvider"
import { IsOnline } from "@/shared/components/IsOnline"
import { ServerStatus } from "@/shared/components/ServerStatus"
import { Settings } from "@/shared/components/Settings"
import { useState } from "react"

function App() {
  const { currentProvider, currentUrl } = useDetectProvider()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <main className="min-w-60 min-h-40 p-4 bg-linear-to-b from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.95)] text-amber-50">
      {/* Header with settings toggle */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-griffin text-4xl">Tune</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
          title={showSettings ? "Back to player" : "Settings"}
        >
          {showSettings ? <div>back</div> : <div>settings</div>}
        </button>
      </div>

      {showSettings ? (
        // Settings view
        <div className="space-y-4 mt-4">
          <h2 className="text-lg font-medium">Settings</h2>
          <Settings />
          <div className="text-xs text-gray-500 mt-4">
            <p>Current tab: {currentUrl || "No active tab"}</p>
            <p>Provider: {currentProvider || "None"}</p>
          </div>
        </div>
      ) : (
        // Player view
        <>
          {!currentProvider && <div className="p-4 text-center text-gray-400 text-lg">Provider was not detected</div>}
          {currentProvider === Providers.youtube && <YoutubeProvider url={currentUrl} />}
        </>
      )}
      <ServerStatus />
      <IsOnline />
    </main>
  )
}

export default App
