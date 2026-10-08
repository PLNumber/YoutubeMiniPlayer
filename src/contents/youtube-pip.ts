import type { PlasmoCSConfig } from "plasmo"

// Safe fallback: true video PiP from a real YouTube watch page and a direct user click.
export const config: PlasmoCSConfig = { matches: ["https://www.youtube.com/*"], run_at: "document_idle" }
const ID = "miniview-pip-control"
function isWatchPage(): boolean {
  return (location.pathname === "/watch" && new URLSearchParams(location.search).has("v")) ||
    location.pathname.startsWith("/shorts/") || location.pathname.startsWith("/live/")
}
function ensureButton(): void {
  if (document.getElementById(ID)) return
  const host = document.createElement("div")
  host.id = ID
  host.style.cssText = "position:fixed;right:22px;bottom:95px;z-index:2147483600;display:none;"
  const shadow = host.attachShadow({ mode: "open" })
  const btn = document.createElement("button")
  btn.textContent = "◩ MiniView PiP"
  btn.type = "button"
  btn.style.cssText = "border:1px solid #aaa3ea;background:#282538;color:#fff;border-radius:999px;padding:11px 16px;box-shadow:0 6px 20px #0008;cursor:pointer;font:650 13px system-ui;"
  const status = document.createElement("div")
  status.style.cssText = "display:none;margin-top:6px;background:#252637;color:#f1f1fc;border-radius:8px;padding:8px 10px;font:12px system-ui;max-width:250px;"
  shadow.append(btn, status)
  document.documentElement.appendChild(host)
  function update(): void {
    const video = document.querySelector<HTMLVideoElement>("video.html5-main-video")
    host.style.display = isWatchPage() && video ? "block" : "none"
    btn.textContent = document.pictureInPictureElement ? "◩ PiP 종료" : "◩ MiniView PiP"
  }
  btn.addEventListener("click", () => {
    const video = document.querySelector<HTMLVideoElement>("video.html5-main-video")
    try {
      if (document.pictureInPictureElement) {
        void document.exitPictureInPicture().then(update).catch(showError)
      } else if (!video || video.readyState < 1 || video.disablePictureInPicture) {
        showError(new Error("재생 중인 영상을 찾을 수 없어요."))
      } else {
        // Call directly during click; no async hop before requesting PiP.
        void video.requestPictureInPicture().then(update).catch(showError)
      }
    } catch (error) { showError(error) }
  })
  function showError(error: unknown): void {
    status.textContent = error instanceof Error ? error.message : "PiP를 열 수 없어요."
    status.style.display = "block"
    setTimeout(() => { status.style.display = "none" }, 4500)
  }
  document.addEventListener("enterpictureinpicture", update, true)
  document.addEventListener("leavepictureinpicture", update, true)
  document.addEventListener("yt-navigate-finish", update)
  setInterval(update, 1800)
  update()
}
if (document.documentElement) ensureButton()
else document.addEventListener("DOMContentLoaded", ensureButton, { once: true })
