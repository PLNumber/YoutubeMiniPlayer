import { createYouTubeSearchUrl, getYouTubeHomeUrl } from "./youtubeService"

export function openPopupWindow(url: string, width: number, height: number) {
  if (typeof chrome !== "undefined" && chrome.windows?.create) {
    chrome.windows.create({
      url,
      type: "popup",
      width,
      height,
      focused: true
    })

    return
  }

  window.open(url, "_blank", `width=${width},height=${height}`)
}

export function openYouTubeSearchWindow(keyword: string) {
  const searchUrl = createYouTubeSearchUrl(keyword)
  openPopupWindow(searchUrl, 900, 700)
}

export function openYouTubeHomeWindow() {
  const homeUrl = getYouTubeHomeUrl()
  openPopupWindow(homeUrl, 900, 700)
}