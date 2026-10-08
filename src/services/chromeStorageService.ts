import { SHORTCUT_ENABLED_KEY } from "../constants/storageKeys"
import type { PlayerMode } from "../types/playerMode"

const PLAYER_MODE_KEY = "playerMode"

export async function getShortcutEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(SHORTCUT_ENABLED_KEY)
  return result[SHORTCUT_ENABLED_KEY] !== false
}

export async function setShortcutEnabled(value: boolean): Promise<void> {
  await chrome.storage.local.set({ [SHORTCUT_ENABLED_KEY]: value })
}

export async function getPlayerMode(): Promise<PlayerMode> {
  const result = await chrome.storage.local.get(PLAYER_MODE_KEY)
  const mode = result[PLAYER_MODE_KEY]
  return mode === "radio" || mode === "window" ? mode : "pip"
}

export async function setPlayerMode(mode: PlayerMode): Promise<void> {
  await chrome.storage.local.set({ [PLAYER_MODE_KEY]: mode })
}
