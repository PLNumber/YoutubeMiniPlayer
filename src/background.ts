import { SHORTCUT_ENABLED_KEY } from "./constants/storageKeys"

const MINI_PLAYER_COMMAND = "open-youtube-mini-player"

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([SHORTCUT_ENABLED_KEY], (result) => {
    if (typeof result[SHORTCUT_ENABLED_KEY] !== "boolean") {
      chrome.storage.local.set({
        [SHORTCUT_ENABLED_KEY]: true
      })
    }
  })
})

chrome.commands.onCommand.addListener((command) => {
  if (command !== MINI_PLAYER_COMMAND) {
    return
  }

  chrome.storage.local.get([SHORTCUT_ENABLED_KEY], async (result) => {
    const isShortcutEnabled = result[SHORTCUT_ENABLED_KEY] !== false

    if (!isShortcutEnabled) {
      return
    }

    try {
      await chrome.action.openPopup()
    } catch (error) {
      console.warn("팝업을 열 수 없습니다.", error)
    }
  })
})