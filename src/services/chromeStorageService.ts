import { SHORTCUT_ENABLED_KEY } from "../constants/storageKeys"

export function getShortcutEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve(true)
      return
    }

    chrome.storage.local.get([SHORTCUT_ENABLED_KEY], (result) => {
      const savedValue = result[SHORTCUT_ENABLED_KEY]

      if (typeof savedValue === "boolean") {
        resolve(savedValue)
        return
      }

      chrome.storage.local.set({
        [SHORTCUT_ENABLED_KEY]: true
      })

      resolve(true)
    })
  })
}

export function setShortcutEnabled(value: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve()
      return
    }

    chrome.storage.local.set(
      {
        [SHORTCUT_ENABLED_KEY]: value
      },
      () => resolve()
    )
  })
}