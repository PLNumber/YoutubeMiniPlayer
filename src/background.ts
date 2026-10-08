import { SHORTCUT_ENABLED_KEY } from "./constants/storageKeys"
import { continueAudioInBackground } from "./services/radioTabService"

const MINI_PLAYER_COMMAND = "open-youtube-mini-player"

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([SHORTCUT_ENABLED_KEY], (result) => {
    if (typeof result[SHORTCUT_ENABLED_KEY] !== "boolean") {
      chrome.storage.local.set({ [SHORTCUT_ENABLED_KEY]: true })
    }
  })
})

chrome.commands.onCommand.addListener((command) => {
  if (command !== MINI_PLAYER_COMMAND) return
  chrome.storage.local.get([SHORTCUT_ENABLED_KEY], async (result) => {
    if (result[SHORTCUT_ENABLED_KEY] === false) return
    try {
      await chrome.action.openPopup()
    } catch (error) {
      console.warn("팝업을 열 수 없습니다.", error)
    }
  })
})

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (typeof message !== "object" || !message || !("type" in message) || message.type !== "YMP_RADIO_CONTINUE") return
  // Only service messages from an actual YouTube tab, never from arbitrary origins.
  if (!sender.tab?.url || !/^https:\/\/www\.youtube\.com\//.test(sender.tab.url)) {
    sendResponse({ ok: false, error: "YouTube 영상 탭에서만 사용할 수 있습니다." })
    return
  }
  void continueAudioInBackground(sender.tab).then(
    () => sendResponse({ ok: true }),
    (error: unknown) => sendResponse({ ok: false, error: error instanceof Error ? error.message : "라디오 모드 전환 실패" })
  )
  return true
})
