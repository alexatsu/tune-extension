import { HeartIcon } from "@/assets/icons/HeartIcon"
import { YoutubeIcon } from "@/assets/icons/YoutubeIcon"
import { browser } from "wxt/browser"
import { useEffect, useState } from "react"
import {
  getGetApiTrackExistYoutubeQueryKey,
  useDeleteApiTrackSharedId,
  useGetApiTrackExistYoutube,
  usePostApiTrackDownload,
} from "@/generated/track/track"
import { DtoTrackStatus, SseSseDownloadEvent } from "@/generated/schemas"
import { DeleteIcon } from "@/assets/icons/DeleteIcon"
import { AddIcon } from "@/assets/icons/AddIcon"
import { queryClient } from "@/shared/lib/queryClient"
import { getGetApiSseQueryKey } from "@/generated/sse/sse"

enum TrackStatusColors {
  exist = "#76EEFF",
  error = "#FF5555",
  queued = "#FFFD7D",
  missing = "#787878",
}

enum Providers {
  youtube = "youtube",
  soundcloud = "soundcloud",
  spotify = "spotify",
}

type Provider = keyof typeof Providers

const providerRegexes: Record<Provider, RegExp> = {
  youtube: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch|v|embed)|youtu\.be\/)/i,
  soundcloud: /^(?:https?:\/\/)?(www\.|m\.)?soundcloud\.com\//i,
  spotify: /^(?:https?:\/\/)?open\.spotify\.com\/(track|user|artist|album)\//i,
} as const

function App() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null)

  const { data, isLoading, error } = useGetApiTrackExistYoutube(
    { url: currentUrl },
    { query: { enabled: !!currentUrl && currentProvider === Providers.youtube } },
  )

  const { mutate: deleteTrack } = useDeleteApiTrackSharedId({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetApiTrackExistYoutubeQueryKey() })
      },
    },
  })

  const { mutate: downloadTrack } = usePostApiTrackDownload({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetApiTrackExistYoutubeQueryKey() })
      },
    },
  })

  useEffect(() => {
    const updateUrl = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) {
          setCurrentUrl(tab.url)
          const provider = Object.entries(providerRegexes).find(([, regex]) => regex.test(tab.url!))?.[0] as Provider
          setCurrentProvider(provider)
        }
      } catch (err) {
        console.error("Tab query failed:", err)
        setCurrentUrl("")
        setCurrentProvider(null)
      }
    }

    browser.tabs.onActivated.addListener(updateUrl)
    browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.url) updateUrl()
    })

    updateUrl()
    return () => {
      browser.tabs.onActivated.removeListener(updateUrl)
      browser.tabs.onUpdated.removeListener(updateUrl)
    }
  }, [])

  useEffect(() => {
    if (!currentUrl) return

    const eventSource = new EventSource(getGetApiSseQueryKey()[0])

    const handleDownloadFinished = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: getGetApiTrackExistYoutubeQueryKey({ url: currentUrl }) })
      } catch (e) {
        console.error("SSE parse error:", e)
      }
    }

    eventSource.addEventListener(SseSseDownloadEvent.EventDownloadFinished, handleDownloadFinished)
    eventSource.onerror = () => console.log("SSE disconnected")

    return () => {
      eventSource.removeEventListener(SseSseDownloadEvent.EventDownloadFinished, handleDownloadFinished)
      eventSource.close()
    }
  }, [currentUrl])

  if (isLoading) return <div className="p-4 text-center">Loading...</div>
  if (error) return <div className="p-4 text-center text-red-400">Error: {error.message}</div>

  return (
    <main className="min-w-60 p-4 bg-linear-to-b from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.95)] text-amber-50 min-h-[200px]">
      <h1 className="font-griffin text-4xl text-center mb-2">Tune</h1>

      {!currentProvider && <div className="p-4 text-center text-gray-400 text-lg">Provider was not detected</div>}

      {currentProvider === Providers.youtube && (
        <>
          <section className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>provider</span>
              <YoutubeIcon />
            </div>

            <div className="flex items-center gap-2">
              <span>track</span>
              {error && <HeartIcon fill={TrackStatusColors.error} />}
              {data && data.status === DtoTrackStatus.TrackQueued && <HeartIcon fill={TrackStatusColors.queued} />}
              {data && data.status === DtoTrackStatus.TrackExist && (
                <div className="flex content-center justify-center gap-2">
                  <HeartIcon className="mt-0.5" fill={TrackStatusColors.exist} />
                  <button
                    className="cursor-pointer hover:bg-amber-400"
                    onClick={() => deleteTrack({ sharedId: data?.sharedId ?? "" })}
                  >
                    <DeleteIcon className="size-5" />
                  </button>
                </div>
              )}
              {!isLoading && !error && !data?.sharedId && (
                <>
                  <HeartIcon fill={TrackStatusColors.missing} />
                  <button
                    className="cursor-pointer hover:bg-amber-400"
                    onClick={() => downloadTrack({ data: { url: currentUrl } })}
                  >
                    <AddIcon />
                  </button>
                </>
              )}
            </div>
          </section>

          {data && <div className="p-2 bg-gray-800 rounded">Track found: {JSON.stringify(data)}</div>}
        </>
      )}
    </main>
  )
}

export default App
