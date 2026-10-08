export function createYouTubeSearchUrl(keyword: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`
}

export function getYouTubeHomeUrl(): string {
  return "https://www.youtube.com/"
}

/** Accepts common shared YouTube video or playlist links; no scraping or audio extraction. */
export function parseYouTubeLink(input: string): string | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null

  const host = url.hostname.toLowerCase()
  const isShort = host === "youtu.be"
  const isYouTube = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)
  if (!isShort && !isYouTube) return null

  let videoId: string | null = null
  if (isShort) {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null
  } else if (url.pathname === "/watch") {
    videoId = url.searchParams.get("v")
  } else {
    const match = url.pathname.match(/^\/(?:shorts|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/)
    videoId = match?.[1] ?? null
  }

  if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    const watch = new URL("https://www.youtube.com/watch")
    watch.searchParams.set("v", videoId)
    const list = url.searchParams.get("list")
    const start = url.searchParams.get("t") ?? url.searchParams.get("start")
    if (list && /^[A-Za-z0-9_-]{2,100}$/.test(list)) watch.searchParams.set("list", list)
    if (start && /^[0-9hms]+$/i.test(start)) watch.searchParams.set("t", start)
    return watch.toString()
  }

  if (isYouTube && url.pathname === "/playlist") {
    const list = url.searchParams.get("list")
    if (list && /^[A-Za-z0-9_-]{2,100}$/.test(list)) {
      return `https://www.youtube.com/playlist?list=${encodeURIComponent(list)}`
    }
  }

  return null
}

export function getYouTubeDestination(input: string): { url: string; direct: boolean } {
  const parsed = parseYouTubeLink(input)
  return parsed
    ? { url: parsed, direct: true }
    : { url: createYouTubeSearchUrl(input.trim()), direct: false }
}
