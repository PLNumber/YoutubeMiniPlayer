import { createYouTubeSearchUrl, getYouTubeHomeUrl } from "./youtubeService"

const WINDOW_ID_KEY = "youtubePopupWindowId"
const WINDOW_WIDTH = 560
const WINDOW_HEIGHT = 740

async function getSavedWindowId(): Promise<number | null> {
  const result = await chrome.storage.session.get(WINDOW_ID_KEY)
  return typeof result[WINDOW_ID_KEY] === "number" ? result[WINDOW_ID_KEY] : null
}

async function saveWindowId(id: number): Promise<void> {
  await chrome.storage.session.set({ [WINDOW_ID_KEY]: id })
}

async function clearWindowId(): Promise<void> {
  await chrome.storage.session.remove(WINDOW_ID_KEY)
}

function isYouTubeUrl(value?: string): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" &&
      ["www.youtube.com", "youtube.com", "m.youtube.com"].includes(url.hostname)
  } catch {
    return false
  }
}

export async function openPopupWindow(
  url: string,
  width = WINDOW_WIDTH,
  height = WINDOW_HEIGHT
): Promise<void> {
  const existingId = await getSavedWindowId()

  if (existingId !== null) {
    try {
      const existingWindow = await chrome.windows.get(existingId, { populate: true })
      const existingTab = existingWindow.tabs?.[0]

      // 기존 팝업에서 사용자가 다른 웹사이트로 이동한 경우 그 창을 건드리지 않습니다.
      if (existingWindow.type === "popup" && existingTab?.id !== undefined &&
          isYouTubeUrl(existingTab.url)) {
        await chrome.tabs.update(existingTab.id, { url, active: true })
        await chrome.windows.update(existingId, { focused: true })
        return
      }
    } catch {
      // 이전 창이 닫혔거나 유효하지 않음: 아래에서 새 창을 만듭니다.
    }
    await clearWindowId()
  }

  const created = await chrome.windows.create({
    url,
    type: "popup",
    width,
    height,
    focused: true
  })
  if (created.id === undefined) throw new Error("새 유튜브 창을 만들지 못했습니다.")
  await saveWindowId(created.id)
}

export function openYouTubeSearchWindow(keyword: string): Promise<void> {
  return openPopupWindow(createYouTubeSearchUrl(keyword))
}

export function openYouTubeHomeWindow(): Promise<void> {
  return openPopupWindow(getYouTubeHomeUrl())
}
