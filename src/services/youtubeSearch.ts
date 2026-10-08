import { VIDEO_ID_PATTERN } from "./videoId"

export type VideoResult = { id: string; title: string; channel: string; thumb: string; publishedAt: string }

type ApiItem = {
  id?: { videoId?: string }
  snippet?: {
    title?: string
    channelTitle?: string
    publishedAt?: string
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } }
  }
}

function messageForError(status: number, reason: string): string {
  if (status === 400) return "API 키 또는 요청 설정을 확인해 주세요."
  if (status === 403) return "YouTube API 권한·사용량 제한·API 키 제한 설정을 확인해 주세요."
  if (status === 429) return "검색 요청이 너무 많아요. 잠시 후 다시 시도해 주세요."
  return `YouTube 검색에 실패했습니다 (${status}${reason ? `: ${reason.slice(0, 90)}` : ""}).`
}

export async function searchVideos(query: string, key: string, signal?: AbortSignal): Promise<VideoResult[]> {
  if (!query.trim()) return []
  if (!key.trim()) throw new Error("검색하려면 YouTube Data API 키를 먼저 설정해 주세요.")
  const params = new URLSearchParams({
    part: "snippet",
    q: query.trim(),
    maxResults: "12",
    type: "video",
    videoEmbeddable: "true",
    safeSearch: "moderate",
    key: key.trim()
  })
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { signal })
  const json = await response.json().catch(() => ({})) as {
    items?: ApiItem[]; error?: { message?: string }
  }
  if (!response.ok) throw new Error(messageForError(response.status, json.error?.message || ""))
  return (json.items || []).flatMap((item) => {
    const id = item.id?.videoId
    if (!id || !VIDEO_ID_PATTERN.test(id)) return []
    const rawThumb = item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || ""
    let thumb = ""
    try {
      const u = new URL(rawThumb)
      if (u.protocol === "https:" && ["i.ytimg.com", "img.youtube.com"].includes(u.hostname)) thumb = u.toString()
    } catch { /* optional thumbnail */ }
    return [{
      id,
      title: item.snippet?.title || "제목 없는 영상",
      channel: item.snippet?.channelTitle || "YouTube",
      thumb,
      publishedAt: item.snippet?.publishedAt || ""
    }]
  })
}
