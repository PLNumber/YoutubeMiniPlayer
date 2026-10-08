/** MiniView window launcher: reuses its dedicated window even after YouTube navigation. */
const MINI_VIEW_URL = chrome.runtime.getURL("tabs/miniview.html")
const WINDOW_STORAGE_KEY = "miniview_window_id"
const AUTO_MINIMIZED_KEY = "miniview_auto_minimized_window_id"
const WIDTH = 420
const HEIGHT = 620

let opening: Promise<void> | null = null

async function getMiniViewWindowId(): Promise<number | null> {
  const stored = await chrome.storage.session.get(WINDOW_STORAGE_KEY)
  const id = stored[WINDOW_STORAGE_KEY]
  if (typeof id !== "number") return null
  try {
    const win = await chrome.windows.get(id)
    return win.type === "popup" ? id : null
  } catch {
    await chrome.storage.session.remove(WINDOW_STORAGE_KEY)
    return null
  }
}

async function openOrFocusMiniView(): Promise<void> {
  let id = await getMiniViewWindowId()
  if (id === null) {
    // Recover if the extension was updated while a MiniView launcher was open.
    const windows = await chrome.windows.getAll({ populate: true, windowTypes: ["popup"] })
    id = windows.find((win) => win.tabs?.some((tab) => tab.url?.split(/[?#]/)[0] === MINI_VIEW_URL))?.id ?? null
  }
  if (id !== null) {
    await chrome.storage.session.set({ [WINDOW_STORAGE_KEY]: id })
    await chrome.windows.update(id, { focused: true, state: "normal" })
    await chrome.storage.session.remove(AUTO_MINIMIZED_KEY)
    return
  }
  const created = await chrome.windows.create({
    url: MINI_VIEW_URL, type: "popup", width: WIDTH, height: HEIGHT, focused: true
  })
  if (typeof created.id === "number") {
    await chrome.storage.session.set({ [WINDOW_STORAGE_KEY]: created.id })
  }
}

function launchMiniView(): void {
  if (opening) return
  opening = openOrFocusMiniView()
    .catch((error: unknown) => console.error("MiniView 창 실행 실패:", error))
    .finally(() => { opening = null })
}

chrome.action.onClicked.addListener(launchMiniView)
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-youtube-mini-player") launchMiniView()
})
chrome.windows.onRemoved.addListener((id) => {
  void chrome.storage.session.get(WINDOW_STORAGE_KEY).then((value) => {
    if (value[WINDOW_STORAGE_KEY] === id) {
      return Promise.all([
        chrome.storage.session.remove(WINDOW_STORAGE_KEY),
        chrome.storage.session.remove(AUTO_MINIMIZED_KEY)
      ])
    }
  })
})

// The content script only adds the "Back to MiniView" button to OUR dedicated popup.
chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (!message || typeof message !== "object" || !("type" in message)) return
  const type = (message as { type: string }).type
  if (!["MINIVIEW_CHECK_WINDOW", "MINIVIEW_RETURN", "MINIVIEW_PIP_STARTED", "MINIVIEW_PIP_ENDED"].includes(type)) return
  void (async () => {
    const id = await getMiniViewWindowId()
    const allowed = id !== null && sender.tab?.windowId === id
    if (allowed && id !== null) {
      if (type === "MINIVIEW_RETURN" && sender.tab?.id !== undefined) {
        await chrome.tabs.update(sender.tab.id, { url: MINI_VIEW_URL })
      }
      if (type === "MINIVIEW_PIP_STARTED") {
        const saved = await chrome.storage.session.get(AUTO_MINIMIZED_KEY)
        if (saved[AUTO_MINIMIZED_KEY] !== id) {
          // Keep the YouTube tab alive. Closing it can also close native PiP.
          await chrome.windows.update(id, { state: "minimized" })
          await chrome.storage.session.set({ [AUTO_MINIMIZED_KEY]: id })
        }
      }
      if (type === "MINIVIEW_PIP_ENDED") {
        const saved = await chrome.storage.session.get(AUTO_MINIMIZED_KEY)
        // Restore only a window MiniView itself minimized, not user-minimized windows.
        if (saved[AUTO_MINIMIZED_KEY] === id) {
          await chrome.windows.update(id, { state: "normal", focused: true })
          await chrome.storage.session.remove(AUTO_MINIMIZED_KEY)
        }
      }
    }
    sendResponse({ ok: allowed })
  })().catch((error: unknown) => {
    console.error("MiniView 메세지 처리 실패:", error)
    sendResponse({ ok: false })
  })
  return true
})
