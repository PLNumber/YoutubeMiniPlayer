import type { PopupLocaleText } from "../types/popupLocaleText"

const koText: PopupLocaleText = {
  appName: "유튜브 미니 플레이어",
  subtitle: "PiP 영상 · 라디오 듣기 · 작은 창",
  modeLabel: "재생 방식",
  pipModeLabel: "▣ PiP",
  radioModeLabel: "♫ 라디오",
  windowModeLabel: "▤ 작은 창",
  pipHint: "영상 링크를 붙여넣으면 바로 영상 페이지로 이동합니다. 영상을 재생한 뒤 화면의 '영상 PiP로 보기' 버튼을 누르세요.",
  radioHint: "유튜브에서 영상을 재생한 뒤 '라디오처럼 듣기'를 누르면 다른 탭으로 이동하며 소리는 계속 재생됩니다. 원본 유튜브 탭은 열려 있어야 해요.",
  windowHint: "유튜브 전체를 별도 작은 창에서 이용합니다. 이 창은 항상 위에 표시되지는 않습니다.",
  focusButton: "▶ 열린 영상으로 이동",
  noVideoTabMessage: "열려 있는 유튜브 영상이 없습니다. 링크를 입력하거나 검색해 영상을 재생하세요.",
  focusedPipMessage: "영상 페이지의 '영상 PiP로 보기' 버튼을 누르세요.",
  focusedRadioMessage: "영상 재생 후 '라디오처럼 듣기'를 누르세요.",
  searchButton: "영상 / 검색 열기",
  openYouTubeButton: "유튜브 홈",
  placeholder: "영상 링크 또는 검색어",
  initialMessage: "원하는 모드를 선택한 뒤 영상 링크나 검색어를 입력하세요.",
  shortcutLabel: "팝업 단축키",
  shortcutKey: "Alt + Y",
  emptySearchError: "영상 링크 또는 검색어를 입력해 주세요.",
  searchResultsMessage: (keyword) => `"${keyword}" 검색 결과를 열었습니다. 영상을 선택하세요.`,
  videoOpenedMessage: "영상 페이지를 열었습니다. 영상 재생 후 모드 버튼을 누르세요.",
  openYouTubeMessage: "유튜브를 열었습니다.",
  shortcutOnMessage: "단축키 사용 중입니다.",
  shortcutOffMessage: "단축키를 사용하지 않습니다.",
  shortcutToggleLabel: "단축키 사용 토글",
  actionError: "실행하지 못했습니다. 확장 프로그램을 새로고침하고 다시 시도하세요."
}

const enText: PopupLocaleText = {
  appName: "YouTube Mini Player",
  subtitle: "PiP video · Radio listening · Small window",
  modeLabel: "Playback mode",
  pipModeLabel: "▣ PiP",
  radioModeLabel: "♫ Radio",
  windowModeLabel: "▤ Window",
  pipHint: "Paste a video URL to skip search. Play the video on YouTube, then click 'Watch in PiP' on the page.",
  radioHint: "Play a video on YouTube, then click 'Listen in background' to switch tabs while the original YouTube tab keeps playing.",
  windowHint: "Browse all of YouTube in a dedicated small window. It is not always on top.",
  focusButton: "▶ Go to video tab",
  noVideoTabMessage: "No YouTube video tab is open. Paste a URL or search for a video first.",
  focusedPipMessage: "Click 'Watch in PiP' on the YouTube video page.",
  focusedRadioMessage: "Play the video, then click 'Listen in background'.",
  searchButton: "Open video / search",
  openYouTubeButton: "YouTube home",
  placeholder: "Video URL or search keywords",
  initialMessage: "Select a mode, then paste a video URL or enter search keywords.",
  shortcutLabel: "Popup shortcut",
  shortcutKey: "Alt + Y",
  emptySearchError: "Enter a video URL or search keywords.",
  searchResultsMessage: (keyword) => `Opened results for "${keyword}". Select a video.`,
  videoOpenedMessage: "Opened the video. Start playback and select the playback mode on the page.",
  openYouTubeMessage: "Opened YouTube.",
  shortcutOnMessage: "Shortcut enabled.",
  shortcutOffMessage: "Shortcut disabled.",
  shortcutToggleLabel: "Toggle shortcut",
  actionError: "Could not complete the action. Reload the extension and try again."
}

export function getPopupText(): PopupLocaleText {
  return navigator.language.toLowerCase().startsWith("ko") ? koText : enText
}
