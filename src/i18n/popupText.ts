import type { PopupLocaleText } from "../types/popupLocaleText"

const koText: PopupLocaleText = {
  appName: "유튜브 미니 플레이어",
  subtitle: "검색하거나 YouTube를 엽니다.",
  placeholder: "검색어 입력",
  initialMessage: "검색어를 입력하고 검색하세요.",
  searchButton: "검색",
  openYouTubeButton: "YouTube",
  shortcutLabel: "단축키",
  shortcutKey: "Alt + Y",
  emptySearchError: "검색어를 입력해주세요.",
  searchMessage: (keyword) => `"${keyword}" 검색 결과를 엽니다.`,
  openYouTubeMessage: "YouTube를 엽니다.",
  shortcutOnMessage: "단축키가 켜졌습니다.",
  shortcutOffMessage: "단축키가 꺼졌습니다.",
  shortcutToggleLabel: "단축키 사용 토글"
}

const enText: PopupLocaleText = {
  appName: "YouTube Mini Player",
  subtitle: "Search or open YouTube.",
  placeholder: "Search keyword",
  initialMessage: "Enter a keyword to search.",
  searchButton: "Search",
  openYouTubeButton: "YouTube",
  shortcutLabel: "Shortcut",
  shortcutKey: "Alt + Y",
  emptySearchError: "Please enter a keyword.",
  searchMessage: (keyword) => `Opening results for "${keyword}".`,
  openYouTubeMessage: "Opening YouTube.",
  shortcutOnMessage: "Shortcut enabled.",
  shortcutOffMessage: "Shortcut disabled.",
  shortcutToggleLabel: "Toggle shortcut"
}

export function getPopupText(): PopupLocaleText {
  const language = navigator.language.toLowerCase()

  if (language.startsWith("ko")) {
    return koText
  }

  return enText
}