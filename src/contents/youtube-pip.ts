import type { PlasmoCSConfig } from "plasmo"
import { findYouTubeVideo, togglePictureInPicture } from "../services/pipService"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  run_at: "document_idle"
}

const HOST_ID = "youtube-mini-player-control-host"
const isKorean = navigator.language.toLowerCase().startsWith("ko")
const labels = isKorean
  ? {
      pip: "▣ 영상 PiP로 보기", close: "▣ PiP 종료", radio: "♫ 라디오처럼 듣기",
      paused: "먼저 유튜브 영상을 재생해 주세요.", radioError: "다른 탭으로 전환하지 못했습니다.",
      pipError: "PiP 실행에 실패했습니다. 영상이 재생 중인지 확인해 주세요."
    }
  : {
      pip: "▣ Watch in PiP", close: "▣ Close PiP", radio: "♫ Listen in background",
      paused: "Play the YouTube video first.", radioError: "Could not switch tabs.",
      pipError: "Could not start PiP. Ensure the video is playing."
    }

function isVideoPage(): boolean {
  const path = location.pathname
  return (path === "/watch" && new URLSearchParams(location.search).has("v")) ||
    path.startsWith("/shorts/") || path.startsWith("/live/")
}

function setupPlayerControls(): void {
  if (document.getElementById(HOST_ID)) return
  const host = document.createElement("div")
  host.id = HOST_ID
  host.style.cssText = "position:fixed;right:16px;bottom:92px;z-index:2147483647;display:none;"
  const shadow = host.attachShadow({ mode: "open" })
  const style = document.createElement("style")
  style.textContent = `
    .actions { display:flex;gap:7px;flex-wrap:wrap;max-width:340px;justify-content:flex-end }
    button { padding:10px 12px;border:1px solid #64748b;border-radius:21px;
      background:#111827;color:white;font:600 12px system-ui,sans-serif;
      box-shadow:0 4px 18px #0008;cursor:pointer }
    button:hover {background:#273449}
    button:focus-visible {outline:3px solid #60a5fa;outline-offset:2px}
    button:disabled {opacity:.55;cursor:wait}
    .radio {border-color:#22c55e}
    [role=status] {display:none;max-width:330px;margin-top:8px;padding:9px;
      border-radius:8px;background:#111827;color:#fff;font:12px/1.4 system-ui,sans-serif}
    [role=status].visible {display:block}
  `
  const actions = document.createElement("div")
  actions.className = "actions"
  const pipButton = document.createElement("button")
  pipButton.type = "button"
  pipButton.textContent = labels.pip
  const radioButton = document.createElement("button")
  radioButton.type = "button"
  radioButton.className = "radio"
  radioButton.textContent = labels.radio
  const status = document.createElement("div")
  status.setAttribute("role", "status")
  actions.append(pipButton, radioButton)
  shadow.append(style, actions, status)
  document.documentElement.appendChild(host)

  let statusTimer: ReturnType<typeof setTimeout> | undefined
  const showMessage = (message: string) => {
    status.textContent = message
    status.classList.add("visible")
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = setTimeout(() => status.classList.remove("visible"), 4200)
  }
  const update = () => {
    const isPip = !!document.pictureInPictureElement
    pipButton.textContent = isPip ? labels.close : labels.pip
    host.style.display = isVideoPage() && (isPip || !!findYouTubeVideo()) ? "block" : "none"
  }

  pipButton.addEventListener("click", async () => {
    pipButton.disabled = true
    try {
      // Direct invocation on the YouTube page preserves transient activation.
      await togglePictureInPicture()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : labels.pipError)
    } finally {
      pipButton.disabled = false
      update()
    }
  })

  radioButton.addEventListener("click", async () => {
    const video = findYouTubeVideo()
    if (!video || video.paused || video.ended) {
      showMessage(labels.paused)
      return
    }
    radioButton.disabled = true
    try {
      // YouTube itself continues playing in its existing tab. Only focus changes.
      const response = await chrome.runtime.sendMessage({ type: "YMP_RADIO_CONTINUE" })
      if (!response?.ok) showMessage(response?.error ?? labels.radioError)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : labels.radioError)
    } finally {
      radioButton.disabled = false
    }
  })

  document.addEventListener("enterpictureinpicture", update, true)
  document.addEventListener("leavepictureinpicture", update, true)
  window.addEventListener("yt-navigate-finish", update)
  window.addEventListener("popstate", update)
  let scheduled: ReturnType<typeof setTimeout> | null = null
  const observer = new MutationObserver(() => {
    if (scheduled !== null) return
    scheduled = setTimeout(() => { scheduled = null; update() }, 400)
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  update()
}

setupPlayerControls()
