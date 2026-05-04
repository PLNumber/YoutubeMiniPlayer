import type { PopupLocaleText } from "../types/popupLocaleText"

const koText: PopupLocaleText = {
  appName: "유튜브 미니 플레이어",
  subtitle: "검색어를 빠르게 YouTube 검색창으로 열어보세요.",
  placeholder: "검색어 입력",
  initialMessage: "검색어를 입력한 뒤 검색하거나, 유튜브 열기로 홈페이지를 여세요.",
  searchButton: "검색",
  openYouTubeButton: "유튜브 열기",
  shortcutLabel: "단축키",
  shortcutKey: "Alt + Y",
  emptySearchError: "검색어를 입력해주세요.",
  searchMessage: (keyword) => `YouTube에서 "${keyword}" 검색 결과를 엽니다.`,
  openYouTubeMessage: "YouTube 홈페이지를 엽니다.",
  shortcutOnMessage: "단축키가 켜졌습니다. Alt + Y로 실행할 수 있습니다.",
  shortcutOffMessage: "단축키가 꺼졌습니다.",
  shortcutToggleLabel: "단축키 사용 토글"
}

const enText: PopupLocaleText = {
  appName: "YouTube Mini Player",
  subtitle: "Quickly open YouTube search results from a keyword.",
  placeholder: "Enter a search keyword",
  initialMessage: "Enter a keyword to search, or open the YouTube homepage.",
  searchButton: "Search",
  openYouTubeButton: "Open YouTube",
  shortcutLabel: "Shortcut",
  shortcutKey: "Alt + Y",
  emptySearchError: "Please enter a search keyword.",
  searchMessage: (keyword) => `Opening YouTube search results for "${keyword}".`,
  openYouTubeMessage: "Opening the YouTube homepage.",
  shortcutOnMessage: "Shortcut enabled. Press Alt + Y to open this extension.",
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