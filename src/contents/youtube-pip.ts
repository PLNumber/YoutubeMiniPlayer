import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  run_at: "document_idle",
  all_frames: false
}

const AUTO_KEY = "miniview_auto_pip_enabled"
const TOOL_ID = "miniview-youtube-toolbar"
const PENDING_KEY = "miniview_pending_native_pip"
const AUTO_TIMEOUT_MS = 6000

let autoPipEnabled = true
let inDedicatedWindow = false
let pipBusy = false
let pendingTimer: number | undefined

type PendingVideo = { videoId: string; at: number }

function isWatchPage(): boolean {
  return location.pathname === "/watch" || location.pathname.startsWith("/shorts/")
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>("video.html5-main-video")
}

function getVideoId(urlString: string): string | null {
  try {
    const url = new URL(urlString, location.href)
    if (url.origin !== "https://www.youtube.com") return null
    const id = url.pathname === "/watch"
      ? url.searchParams.get("v")
      : url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

function showMessage(text: string): void {
  const node = document.getElementById(TOOL_ID)?.shadowRoot
    ?.querySelector<HTMLElement>("[data-message]")
  if (!node) return
  node.textContent = text
  node.style.display = "block"
  window.setTimeout(() => { if (node.textContent === text) node.style.display = "none" }, 4500)
}

function send(type: string): void {
  if (!inDedicatedWindow) return
  void chrome.runtime.sendMessage({ type }).catch((error: unknown) => {
    console.debug("MiniView 창 상태 알림 실패:", error)
  })
}

function clearPending(): void {
  sessionStorage.removeItem(PENDING_KEY)
  if (pendingTimer !== undefined) window.clearInterval(pendingTimer)
  pendingTimer = undefined
}

function readPending(): PendingVideo | null {
  try {
    const value = sessionStorage.getItem(PENDING_KEY)
    if (!value) return null
    const data: unknown = JSON.parse(value)
    if (!data || typeof data !== "object") return null
    const item = data as Record<string, unknown>
    if (typeof item.videoId !== "string" || typeof item.at !== "number") return null
    return { videoId: item.videoId, at: item.at }
  } catch {
    return null
  }
}

// Must be invoked synchronously while the browser still has a user activation.
// The Promise is awaited only AFTER requestPictureInPicture has been called.
function requestNativePip(video: HTMLVideoElement, manual: boolean): void {
  if (pipBusy || document.pictureInPictureElement) return
  if (video.readyState < HTMLMediaElement.HAVE_METADATA || video.disablePictureInPicture) {
    if (manual) showMessage("영상 준비가 완료되면 다시 눌러주세요.")
    return
  }
  pipBusy = true
  let promise: Promise<PictureInPictureWindow>
  try {
    promise = video.requestPictureInPicture()
  } catch (error) {
    pipBusy = false
    if (manual) showMessage(String(error))
    return
  }
  void promise.then(() => {
    clearPending()
    // enterpictureinpicture also notifies the service worker; it is idempotent.
    send("MINIVIEW_PIP_STARTED")
  }).catch((error: unknown) => {
    // No fake iframe player: if auto PiP is denied, keep the normal YouTube video.
    if (manual) showMessage(error instanceof Error ? error.message : String(error))
    else showMessage("자동 PiP가 제한됐어요. 'PiP로 보기'를 눌러주세요.")
    clearPending()
  }).finally(() => { pipBusy = false })
}

// YouTube normally navigates as a SPA, so the click activation MAY survive
// until the watch page's real video becomes ready. It is not guaranteed.
function tryPendingAutoPip(): void {
  if (!inDedicatedWindow || !autoPipEnabled || pipBusy) return
  const pending = readPending()
  if (!pending) return
  if (Date.now() - pending.at > AUTO_TIMEOUT_MS) { clearPending(); return }
  if (getVideoId(location.href) !== pending.videoId) return
  if (!isWatchPage()) return
  if (document.pictureInPictureElement) { clearPending(); return }

  const video = getVideoElement()
  if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) return
  const flexyId = document.querySelector("ytd-watch-flexy")?.getAttribute("video-id")
  if (flexyId && flexyId !== pending.videoId) return

  // A click from the result page cannot be recreated by timers or messages.
  if (navigator.userActivation && !navigator.userActivation.isActive) {
    clearPending()
    return
  }
  requestNativePip(video, false)
}

function rememberVideoSelection(event: MouseEvent): void {
  if (!inDedicatedWindow || !autoPipEnabled || !event.isTrusted || event.defaultPrevented) return
  if (location.pathname !== "/results") return
  if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (!(event.target instanceof Element)) return
  const anchor = event.target.closest<HTMLAnchorElement>("a[href]")
  if (!anchor) return
  const card = anchor.closest("ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer, yt-lockup-view-model")
  if (!card) return
  const videoId = getVideoId(anchor.href)
  if (!videoId) return
  // Do not block YouTube's native result click/navigation or scrape results.
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ videoId, at: Date.now() }))
  if (pendingTimer === undefined) pendingTimer = window.setInterval(tryPendingAutoPip, 120)
}

// If the user must click YouTube's Play control, reuse THAT real user click
// to open native PiP, instead of asking for another MiniView button click.
function pipWhenPlayClicked(event: MouseEvent): void {
  if (!inDedicatedWindow || !autoPipEnabled || !isWatchPage() || !event.isTrusted) return
  if (!(event.target instanceof Element)) return
  if (!event.target.closest(".ytp-play-button, .ytp-large-play-button")) return
  const video = getVideoElement()
  if (video && video.paused && !document.pictureInPictureElement) requestNativePip(video, false)
}

function makeButton(label: string, listener: () => void): HTMLButtonElement {
  const element = document.createElement("button")
  element.type = "button"
  element.textContent = label
  element.style.cssText = "border:1px solid #a69cea;background:#272535;color:#f8f6ff;border-radius:20px;box-shadow:0 5px 18px #0006;padding:9px 13px;font:600 12px system-ui;cursor:pointer;white-space:nowrap"
  element.addEventListener("click", listener)
  return element
}

function showToolbar(): void {
  if (document.getElementById(TOOL_ID)) return
  const host = document.createElement("div")
  host.id = TOOL_ID
  host.style.cssText = "position:fixed;z-index:2147483600;right:16px;bottom:90px;display:none"
  const shadow = host.attachShadow({ mode: "open" })
  const row = document.createElement("div")
  row.style.cssText = "display:flex;justify-content:flex-end;gap:5px;align-items:center"
  const pipButton = makeButton("◩ PiP로 보기", () => {
    if (document.pictureInPictureElement) {
      void document.exitPictureInPicture().catch((e: unknown) => showMessage(String(e)))
      return
    }
    const video = getVideoElement()
    if (!video) { showMessage("영상을 재생한 후 다시 눌러주세요."); return }
    requestNativePip(video, true)
  })
  const backButton = makeButton("← MiniView 검색", () => send("MINIVIEW_RETURN"))
  row.append(pipButton, backButton)
  const message = document.createElement("div")
  message.dataset.message = "true"
  message.style.cssText = "display:none;margin-top:5px;background:#242332;color:#eeeefc;border-radius:9px;padding:8px 11px;font:11px system-ui;max-width:280px"
  shadow.append(row, message)
  document.documentElement.appendChild(host)

  const update = (): void => {
    const watch = isWatchPage() && !!getVideoElement()
    pipButton.style.display = watch ? "block" : "none"
    pipButton.textContent = document.pictureInPictureElement ? "◩ PiP 닫기" : "◩ PiP로 보기"
    backButton.style.display = inDedicatedWindow ? "block" : "none"
    host.style.display = watch || inDedicatedWindow ? "block" : "none"
  }
  document.addEventListener("yt-navigate-finish", () => { update(); tryPendingAutoPip() })
  document.addEventListener("enterpictureinpicture", () => { update(); send("MINIVIEW_PIP_STARTED") }, true)
  document.addEventListener("leavepictureinpicture", () => { update(); send("MINIVIEW_PIP_ENDED") }, true)
  window.setInterval(update, 1800)
  update()
}

function main(): void {
  void chrome.runtime.sendMessage({ type: "MINIVIEW_CHECK_WINDOW" }).then((result: { ok?: boolean }) => {
    inDedicatedWindow = result?.ok === true
    if (inDedicatedWindow) {
      document.addEventListener("click", rememberVideoSelection, true)
      document.addEventListener("click", pipWhenPlayClicked, true)
      if (readPending()) pendingTimer = window.setInterval(tryPendingAutoPip, 120)
    }
    showToolbar()
  }).catch(showToolbar)

  void chrome.storage.local.get(AUTO_KEY).then((items) => {
    autoPipEnabled = items[AUTO_KEY] !== false
    if (!autoPipEnabled) clearPending()
  })
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && AUTO_KEY in changes) {
      autoPipEnabled = changes[AUTO_KEY].newValue !== false
      if (!autoPipEnabled) clearPending()
    }
  })
}
if (document.documentElement) main()
else document.addEventListener("DOMContentLoaded", main, { once: true })
