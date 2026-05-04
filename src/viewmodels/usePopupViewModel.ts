import { useEffect, useMemo, useState } from "react"

import { getPopupText } from "../i18n/popupText"
import { getShortcutEnabled, setShortcutEnabled } from "../services/chromeStorageService"
import { openYouTubeHomeWindow, openYouTubeSearchWindow } from "../services/chromeWindowService"

export function usePopupViewModel() {
  const text = useMemo(() => getPopupText(), [])

  const [inputValue, setInputValue] = useState("")
  const [message, setMessage] = useState(text.initialMessage)
  const [isError, setIsError] = useState(false)
  const [isShortcutEnabled, setIsShortcutEnabled] = useState(true)

  useEffect(() => {
    setMessage(text.initialMessage)

    getShortcutEnabled().then((enabled) => {
      setIsShortcutEnabled(enabled)
    })
  }, [text.initialMessage])

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value)
  }

  function handleSearch() {
    const keyword = inputValue.trim()

    if (!keyword) {
      setIsError(true)
      setMessage(text.emptySearchError)
      return
    }

    setIsError(false)
    setMessage(text.searchMessage(keyword))
    openYouTubeSearchWindow(keyword)
  }

  function handleOpenYouTube() {
    setIsError(false)
    setMessage(text.openYouTubeMessage)
    openYouTubeHomeWindow()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  async function handleToggleShortcut() {
    const nextValue = !isShortcutEnabled

    setIsShortcutEnabled(nextValue)
    await setShortcutEnabled(nextValue)

    setIsError(false)
    setMessage(nextValue ? text.shortcutOnMessage : text.shortcutOffMessage)
  }

  return {
    text,
    inputValue,
    message,
    isError,
    isShortcutEnabled,
    handleInputChange,
    handleSearch,
    handleOpenYouTube,
    handleKeyDown,
    handleToggleShortcut
  }
}