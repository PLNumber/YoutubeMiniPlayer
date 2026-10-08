export const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

export function getYouTubeVideoId(value: string): string | null {
  const input = value.trim()
  if (VIDEO_ID_PATTERN.test(input)) return input
  let url: URL
  try { url = new URL(input) } catch { return null }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null
  const host = url.hostname.toLowerCase()
  let id: string | null = null
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] || null
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    const parts = url.pathname.split("/").filter(Boolean)
    if (parts[0] === "watch") id = url.searchParams.get("v")
    else if (["shorts", "live", "embed"].includes(parts[0])) id = parts[1] || null
  }
  return id && VIDEO_ID_PATTERN.test(id) ? id : null
}

export function youtubeWatchUrl(id: string): string {
  if (!VIDEO_ID_PATTERN.test(id)) throw new Error("올바른 YouTube 영상 ID가 아닙니다.")
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
}
