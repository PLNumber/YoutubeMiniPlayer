import { SHORTCUT_ENABLED_KEY } from "./constants/storageKeys"

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
  if (command !== "open-youtube-mini-player") {
    return
  }

  chrome.storage.local.get([SHORTCUT_ENABLED_KEY], async (result) => {
    const isShortcutEnabled = result[SHORTCUT_ENABLED_KEY] !== false

    if (!isShortcutEnabled) {
      return
    }

    try {
      await chrome.action.openPopup()
    } catch {
      chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 420,
        height: 560,
        focused: true
      })
    }
  })
})