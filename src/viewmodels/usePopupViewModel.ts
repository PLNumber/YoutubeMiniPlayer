import { useEffect, useMemo, useState } from "react"
import { getPopupText } from "../i18n/popupText"
import {
  getPlayerMode, getShortcutEnabled, setPlayerMode, setShortcutEnabled
} from "../services/chromeStorageService"
import { focusYouTubeVideoTab } from "../services/pipTabService"
import { openPopupWindow, openYouTubeHomeWindow } from "../services/chromeWindowService"
import { getYouTubeDestination, getYouTubeHomeUrl } from "../services/youtubeService"
import type { PlayerMode } from "../types/playerMode"

export function usePopupViewModel() {
  const text = useMemo(getPopupText, [])
  const [mode, setMode] = useState<PlayerMode>("pip")
  const [inputValue, setInputValue] = useState("")
  const [message, setMessage] = useState(text.initialMessage)
  const [isError, setIsError] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [isShortcutEnabled, setIsShortcutEnabled] = useState(true)

  useEffect(() => {
    getPlayerMode().then(setMode).catch(console.warn)
    getShortcutEnabled().then(setIsShortcutEnabled).catch(console.warn)
  }, [])

  async function handleModeChange(nextMode: PlayerMode) {
    setMode(nextMode)
    setIsError(false)
    setMessage(text.initialMessage)
    try {
      await setPlayerMode(nextMode)
    } catch (error) {
      console.warn("모드 저장 실패", error)
      setIsError(true)
      setMessage(text.actionError)
    }
  }

  async function performAction(action: () => Promise<unknown>, successMessage: string) {
    if (isBusy) return
    setIsBusy(true)
    setIsError(false)
    try {
      await action()
      setMessage(successMessage)
    } catch (error) {
      console.warn("재생 모드 실행 실패", error)
      setIsError(true)
      setMessage(text.actionError)
    } finally {
      setIsBusy(false)
    }
  }

  function handleSearch() {
    const value = inputValue.trim()
    if (!value) {
      setIsError(true)
      setMessage(text.emptySearchError)
      return
    }
    const { url, direct } = getYouTubeDestination(value)
    void performAction(
      mode === "window"
        ? () => openPopupWindow(url)
        : () => chrome.tabs.create({ url, active: true }),
      direct ? text.videoOpenedMessage : text.searchResultsMessage(value)
    )
  }

  function handleOpenYouTube() {
    void performAction(
      mode === "window"
        ? () => openYouTubeHomeWindow()
        : () => chrome.tabs.create({ url: getYouTubeHomeUrl(), active: true }),
      text.openYouTubeMessage
    )
  }

  async function handleGoToVideo() {
    if (isBusy) return
    setIsBusy(true)
    setIsError(false)
    try {
      const found = await focusYouTubeVideoTab()
      if (!found) {
        setIsError(true)
        setMessage(text.noVideoTabMessage)
        return
      }
      setMessage(mode === "radio" ? text.focusedRadioMessage : text.focusedPipMessage)
    } catch (error) {
      console.warn("영상 탭 전환 실패", error)
      setIsError(true)
      setMessage(text.actionError)
    } finally {
      setIsBusy(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleSearch()
  }

  async function handleToggleShortcut() {
    const next = !isShortcutEnabled
    try {
      await setShortcutEnabled(next)
      setIsShortcutEnabled(next)
      setIsError(false)
      setMessage(next ? text.shortcutOnMessage : text.shortcutOffMessage)
    } catch (error) {
      console.warn("단축키 저장 실패", error)
      setIsError(true)
      setMessage(text.actionError)
    }
  }

  return {
    text, mode, inputValue, message, isError, isBusy, isShortcutEnabled,
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value),
    handleModeChange, handleSearch, handleOpenYouTube, handleGoToVideo,
    handleKeyDown, handleToggleShortcut
  }
}
