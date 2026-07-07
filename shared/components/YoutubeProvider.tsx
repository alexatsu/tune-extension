import { AddIcon } from "@/assets/icons/AddIcon"
import { HeartIcon } from "@/assets/icons/HeartIcon"
import { YoutubeIcon } from "@/assets/icons/YoutubeIcon"
import { TrackStatusColors } from "@/shared/consts/status"
import { DtoTrackStatus, SseSseDownloadEvent } from "@/shared/generated/schemas"
import { getGetApiSseQueryKey } from "@/shared/generated/sse/sse"
import {
  useGetApiTrackExistYoutube,
  getGetApiTrackExistYoutubeQueryKey,
  usePostApiTrackDownload,
} from "@/shared/generated/track/track"
import { queryClient } from "@/shared/lib/queryClient"

export function YoutubeProvider({ url }: { url: string }) {
  const { data, isLoading, error, refetch } = useGetApiTrackExistYoutube(
    { url }, 
    { query: { enabled: !!url } }
  )

  const { mutate: downloadTrack, isPending: isDownloading } = usePostApiTrackDownload({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetApiTrackExistYoutubeQueryKey({ url }) })
      },
    },
  })

  useEffect(() => {
    const eventSource = new EventSource(getGetApiSseQueryKey()[0])

    const sseDownloadFinished = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: getGetApiTrackExistYoutubeQueryKey({ url }) })
      } catch (e) {
        console.error("SSE parse error:", e)
      }
    }

    eventSource.addEventListener(SseSseDownloadEvent.EventDownloadFinished, sseDownloadFinished)
    eventSource.onerror = () => console.log("SSE disconnected")

    return () => {
      eventSource.removeEventListener(SseSseDownloadEvent.EventDownloadFinished, sseDownloadFinished)
      eventSource.close()
    }
  }, [url])

  console.log(data, url, "here")

  const handleRetry = () => {
    refetch()
  }

  const handleDownload = () => {
    console.log(data, url, "in download")
    downloadTrack({ data: { url } })
  }

  // Check if track exists in DB but files are missing (needs re-download)
  const needsRedownload = data?.inDb && !data?.inFs && data?.sharedId

  return (
    <>
      <section className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>provider</span>
          <YoutubeIcon />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span>track</span>
          
          {/* Error state with retry */}
          {error && (
            <div className="flex content-center justify-center gap-2 animate-fadeIn">
              <HeartIcon fill={TrackStatusColors.error} />
              <button
                className="flex items-center justify-center cursor-pointer hover:bg-slate-800/80 rounded transition-colors px-1"
                onClick={handleRetry}
                title="Retry checking track"
              >
                <span className="text-xs">↻</span>
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && !error && (
            <div className="flex content-center justify-center gap-2">
              <HeartIcon fill={TrackStatusColors.queued} />
              <button className="px-[2px] flex items-center justify-center rounded">
                <div className="w-3 h-3 border-2 border-[rgb(255,253,125)] border-t-transparent rounded-full animate-spin" />
              </button>
            </div>
          )}

          {/* Queued state */}
          {!isLoading && !error && data && data.status === DtoTrackStatus.TrackQueued && (
            <div className="flex content-center justify-center gap-2 animate-fadeIn">
              <HeartIcon fill={TrackStatusColors.queued} />
              <button className="px-[2px] flex items-center justify-center rounded">
                <div className="w-3 h-3 border-2 border-[rgb(255,253,125)] border-t-transparent rounded-full animate-spin" />
              </button>
            </div>
          )}

          {/* File missing - re-download needed */}
          {!isLoading && !error && data && needsRedownload && (
            <div className="flex content-center justify-center gap-2 animate-fadeIn">
              <HeartIcon fill={TrackStatusColors.missing} />
              <button
                className="flex items-center justify-center cursor-pointer hover:bg-slate-800/80 rounded transition-colors px-1"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Re-download missing files"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-sm">↻</span>
                )}
              </button>
              <span className="text-xs text-yellow-500">(files missing)</span>
            </div>
          )}

          {/* Track completely missing - first time download */}
          {!isLoading && !error && data && !data.inDb && !data.sharedId && (
            <div className="flex content-center justify-center gap-2 animate-fadeIn">
              <HeartIcon fill={TrackStatusColors.missing} />
              <button
                className="flex items-center justify-center cursor-pointer hover:bg-slate-800/80 rounded transition-colors"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AddIcon className="size-4" />
                )}
              </button>
            </div>
          )}

          {/* Track exists and files are present */}
          {!isLoading && !error && data && data.inDb && data.inFs && data.sharedId && (
            <div className="flex content-center justify-center gap-2">
              <HeartIcon fill={TrackStatusColors.exist} />
              <span className="text-xs text-green-400">✓</span>
            </div>
          )}
        </div>
      </section>
    </>
  )
}