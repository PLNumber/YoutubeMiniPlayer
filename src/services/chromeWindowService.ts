import { createYouTubeSearchUrl, getYouTubeHomeUrl } from "./youtubeService"

const YOUTUBE_POPUP_WINDOW_ID_KEY = "youtubePopupWindowId"

const YOUTUBE_POPUP_WIDTH = 900
const YOUTUBE_POPUP_HEIGHT = 700

function hasChromeWindowApi(): boolean {
  return typeof chrome !== "undefined" && !!chrome.windows?.create
}

function getSavedWindowId(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.session) {
      resolve(null)
      return
    }

    chrome.storage.session.get([YOUTUBE_POPUP_WINDOW_ID_KEY], (result) => {
      const windowId = result[YOUTUBE_POPUP_WINDOW_ID_KEY]

      resolve(typeof windowId === "number" ? windowId : null)
    })
  })
}

function setSavedWindowId(windowId: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.session) {
      resolve()
      return
    }

    chrome.storage.session.set(
      {
        [YOUTUBE_POPUP_WINDOW_ID_KEY]: windowId
      },
      () => resolve()
    )
  })
}

function clearSavedWindowId(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.session) {
      resolve()
      return
    }

    chrome.storage.session.remove([YOUTUBE_POPUP_WINDOW_ID_KEY], () => resolve())
  })
}

async function focusAndNavigateExistingWindow(
  windowId: number,
  url: string
): Promise<boolean> {
  try {
    const targetWindow = await chrome.windows.get(windowId, {
      populate: true
    })

    if (!targetWindow.id) {
      await clearSavedWindowId()
      return false
    }

    await chrome.windows.update(targetWindow.id, {
      focused: true
    })

    const targetTab = targetWindow.tabs?.[0]

    if (!targetTab?.id) {
      await clearSavedWindowId()
      return false
    }

    await chrome.tabs.update(targetTab.id, {
      url,
      active: true
    })

    return true
  } catch {
    await clearSavedWindowId()
    return false
  }
}

async function createYouTubePopupWindow(url: string): Promise<void> {
  const createdWindow = await chrome.windows.create({
    url,
    type: "popup",
    width: YOUTUBE_POPUP_WIDTH,
    height: YOUTUBE_POPUP_HEIGHT,
    focused: true
  })

  if (createdWindow.id) {
    await setSavedWindowId(createdWindow.id)
  }
}

export async function openPopupWindow(
  url: string,
  width = YOUTUBE_POPUP_WIDTH,
  height = YOUTUBE_POPUP_HEIGHT
): Promise<void> {
  if (!hasChromeWindowApi()) {
    window.open(url, "_blank", `width=${width},height=${height}`)
    return
  }

  const savedWindowId = await getSavedWindowId()

  if (savedWindowId !== null) {
    const reused = await focusAndNavigateExistingWindow(savedWindowId, url)

    if (reused) {
      return
    }
  }

  await createYouTubePopupWindow(url)
}

export function openYouTubeSearchWindow(keyword: string): Promise<void> {
  const searchUrl = createYouTubeSearchUrl(keyword)
  return openPopupWindow(searchUrl)
}

export function openYouTubeHomeWindow(): Promise<void> {
  const homeUrl = getYouTubeHomeUrl()
  return openPopupWindow(homeUrl)
}