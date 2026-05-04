export function createYouTubeSearchUrl(keyword: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`
}

export function getYouTubeHomeUrl(): string {
  return "https://www.youtube.com"
}