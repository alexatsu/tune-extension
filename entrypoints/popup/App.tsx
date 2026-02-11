import { Providers, useDetectProvider } from "@/shared/hooks/useDetectProvider"
import { YoutubeProvider } from "@/shared/components/YoutubeProvider"
import { IsOnline } from "@/shared/components/IsOnline"

function App() {
  const { currentProvider, currentUrl } = useDetectProvider()

  return (
    <main className="min-w-60 p-4 bg-linear-to-b from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.95)] text-amber-50 ">
      <h1 className="font-griffin text-4xl text-center mb-2">Tune</h1>

      {!currentProvider && <div className="p-4 text-center text-gray-400 text-lg">Provider was not detected</div>}
      {currentProvider === Providers.youtube && <YoutubeProvider url={currentUrl} />}
      <IsOnline />
    </main>
  )
}

export default App
