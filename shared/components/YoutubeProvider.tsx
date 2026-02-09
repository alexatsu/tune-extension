import { AddIcon } from "@/assets/icons/AddIcon"
import { DeleteIcon } from "@/assets/icons/DeleteIcon"
import { HeartIcon } from "@/assets/icons/HeartIcon"
import { YoutubeIcon } from "@/assets/icons/YoutubeIcon"
import { TrackStatusColors } from "@/shared/consts/status"
import { DtoTrackStatus, SseSseDownloadEvent } from "@/shared/generated/schemas"
import { getGetApiSseQueryKey } from "@/shared/generated/sse/sse"
import {
  useGetApiTrackExistYoutube,
  useDeleteApiTrackSharedId,
  getGetApiTrackExistYoutubeQueryKey,
  usePostApiTrackDownload,
} from "@/shared/generated/track/track"
import { queryClient } from "@/shared/lib/queryClient"

export function YoutubeProvider({ currentUrl }: { currentUrl: string }) {
  const { data, isLoading, error } = useGetApiTrackExistYoutube(
    { url: currentUrl },
    { query: { enabled: !!currentUrl } },
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
    if (!currentUrl) return

    const eventSource = new EventSource(getGetApiSseQueryKey()[0])

    const sseDownloadFinished = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: getGetApiTrackExistYoutubeQueryKey({ url: currentUrl }) })
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
  }, [currentUrl])

  return (
    <>
      <section className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>provider</span>
          <YoutubeIcon />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span>track</span>
          {error && <HeartIcon fill={TrackStatusColors.error} />}

          {data && data.status === DtoTrackStatus.TrackQueued && (
            <div
              className={`flex content-center justify-center gap-2 ${data.status === DtoTrackStatus.TrackQueued ? "animate-fadeIn" : ""}`}
            >
              <HeartIcon fill={TrackStatusColors.queued} />
              <button className="px-[2px] flex items-center justify-center rounded">
                <div className="w-3 h-3 border-2 border-[rgb(255,253,125)] border-t-transparent rounded-full animate-spin" />
              </button>
            </div>
          )}

          {data && data.status === DtoTrackStatus.TrackExist && (
            <div
              className={`flex content-center justify-center gap-2 ${data.status === DtoTrackStatus.TrackExist ? "animate-fadeIn" : ""}`}
            >
              <HeartIcon fill={TrackStatusColors.exist} />
              <button
                className="flex items-center justify-center cursor-pointer  hover:bg-slate-800/80 rounded transition-colors"
                onClick={() => deleteTrack({ sharedId: data?.sharedId ?? "" })}
              >
                <DeleteIcon className="size-4" />
              </button>
            </div>
          )}

          {!isLoading && !error && !data?.sharedId && (
            <div className={`flex content-center justify-center gap-2 ${!data?.sharedId ? "animate-fadeIn" : ""}`}>
              <HeartIcon fill={TrackStatusColors.missing} />
              <button
                className="flex items-center justify-center cursor-pointer hover:bg-slate-800/80 rounded transition-colors"
                onClick={() => downloadTrack({ data: { url: currentUrl } })}
              >
                <AddIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
