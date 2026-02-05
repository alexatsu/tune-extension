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
import { DtoTrackStatus } from "@/generated/schemas"
import { DeleteIcon } from "@/assets/icons/DeleteIcon"
import { AddIcon } from "@/assets/icons/AddIcon"
import { queryClient } from "@/shared/lib/queryClient"

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be)/

function App() {
  const [isYoutube, setIsYoutube] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  const { data, isLoading, error } = useGetApiTrackExistYoutube(
    { url: currentUrl },
    { query: { enabled: !!currentUrl && isYoutube } },
  )

  const { mutate: deleteTrack } = useDeleteApiTrackSharedId({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetApiTrackExistYoutubeQueryKey(),
        })
      },
    },
  })

  const { mutate: downloadTrack } = usePostApiTrackDownload({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetApiTrackExistYoutubeQueryKey(),
        })
      },
    },
  })

  console.log(data, "lol")

  useEffect(() => {
    const updateUrl = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) {
          setCurrentUrl(tab.url)
          setIsYoutube(youtubeRegex.test(tab.url))
        }
      } catch (err) {
        console.error("Tab query failed:", err)
        setCurrentUrl("")
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

  if (isLoading) return <div className="p-4 text-center">Loading...</div>
  if (error) return <div className="p-4 text-center text-red-400">Error: {error.message}</div>

  return (
    <main className="min-w-60 p-4 bg-linear-to-b from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.95)] text-amber-50 min-h-[200px]">
      <h1 className="font-griffin text-4xl text-center mb-2">Tune</h1>

      {!isYoutube && <div className="p-4 text-center text-gray-400 text-lg">Open a YouTube video to track it</div>}

      {isYoutube && (
        <>
          <section className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>provider</span>
              <YoutubeIcon />
            </div>

            <div className="flex items-center gap-2">
              <span>track</span>
              {error && <HeartIcon fill="#FF5555" />}
              {data?.sharedId && (
                <div className="flex content-center justify-center gap-2">
                  <HeartIcon className="mt-0.5" />
                  <button className="cursor-pointer" onClick={() => deleteTrack({ sharedId: data?.sharedId ?? "" })}>
                    <DeleteIcon className="mt-1" />
                  </button>
                </div>
              )}
              {!isLoading && !error && !data?.sharedId && (
                <>
                  <HeartIcon fill={data?.status === DtoTrackStatus.TrackMissing ? "#787878" : undefined} />
                  <button className="cursor-pointer" onClick={() => downloadTrack({ data: { url: currentUrl } })}>
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
