import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"], run_at: "document_idle", all_frames: false
}

const AUTO_KEY = "miniview_auto_pip_enabled"
const TOOL_ID = "miniview-youtube-toolbar"
const WATCH_PATHS = new Set(["watch"])
let autoPipEnabled = true
let inDedicatedWindow = false
let busy = false

type PipPage = Window & { document: Document }
type DocumentPip = { requestWindow(options?: { width: number; height: number }): Promise<PipPage> }

function getPipApi(): DocumentPip | null {
  const api = (window as Window & { documentPictureInPicture?: DocumentPip }).documentPictureInPicture
  return typeof api?.requestWindow === "function" ? api : null
}

function watchVideoId(href: string): string | null {
  try {
    const url = new URL(href, location.href)
    if (url.origin !== "https://www.youtube.com") return null
    const id = url.pathname === "/watch" ? url.searchParams.get("v")
      : url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
  } catch { return null }
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>("video.html5-main-video")
}
function isWatchPage(): boolean {
  return location.pathname === "/watch" || location.pathname.startsWith("/shorts/")
}

function showMessage(text: string): void {
  const box = document.getElementById(TOOL_ID)
  const root = box?.shadowRoot
  const element = root?.querySelector<HTMLElement>("[data-message]")
  if (element) {
    element.textContent = text
    element.style.display = "block"
    setTimeout(() => { element.style.display = "none" }, 5000)
  }
}

function makeButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button")
  button.textContent = label
  button.type = "button"
  button.style.cssText = "border:1px solid #a69cea;background:#272535;color:#f8f6ff;border-radius:20px;box-shadow:0 5px 18px #0006;padding:9px 13px;font:600 12px system-ui;cursor:pointer;white-space:nowrap"
  button.addEventListener("click", onClick)
  return button
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
    const video = getVideoElement()
    if (!video) { showMessage("영상을 재생한 후 다시 눌러주세요."); return }
    if (document.pictureInPictureElement) {
      void document.exitPictureInPicture().catch((e: unknown) => showMessage(String(e)))
    } else if (video.readyState >= 1 && !video.disablePictureInPicture) {
      // Synchronously invoke under direct, trusted user click.
      void video.requestPictureInPicture().catch((e: unknown) => showMessage(String(e)))
    } else {
      showMessage("영상 재생 준비가 완료되지 않았어요.")
    }
  })
  const backButton = makeButton("← MiniView 검색", () => {
    void chrome.runtime.sendMessage({ type: "MINIVIEW_RETURN" })
  })
  row.append(pipButton, backButton)
  const message = document.createElement("div")
  message.dataset.message = "true"
  message.style.cssText = "display:none;margin-top:5px;background:#242332;color:#eeeefc;border-radius:9px;padding:8px 11px;font:11px system-ui;max-width:280px"
  shadow.append(row, message)
  document.documentElement.appendChild(host)

  function update(): void {
    const watch = isWatchPage() && !!getVideoElement()
    pipButton.style.display = watch ? "block" : "none"
    pipButton.textContent = document.pictureInPictureElement ? "◩ PiP 닫기" : "◩ PiP로 보기"
    backButton.style.display = inDedicatedWindow ? "block" : "none"
    host.style.display = watch || inDedicatedWindow ? "block" : "none"
  }
  document.addEventListener("yt-navigate-finish", update)
  document.addEventListener("enterpictureinpicture", update, true)
  document.addEventListener("leavepictureinpicture", update, true)
  setInterval(update, 1800)
  update()
}

// The click on an ACTUAL YouTube search result is the user gesture.
// Unlike v3.1, the PiP is opened in youtube.com (not chrome-extension://).
// This is experimental: YouTube may still block embedded video or autoplay.
function interceptNativeResultClick(event: MouseEvent): void {
  if (!autoPipEnabled || busy || !event.isTrusted || event.defaultPrevented) return
  if (location.pathname !== "/results") return
  if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (!(event.target instanceof Element)) return
  const anchor = event.target.closest<HTMLAnchorElement>("a[href]")
  if (!anchor) return
  // Handle a clicked search result only: do not collect or scrape results data.
  const card = anchor.closest("ytd-video-renderer,ytd-rich-item-renderer,ytd-grid-video-renderer,yt-lockup-view-model")
  if (!card) return
  const id = watchVideoId(anchor.href)
  if (!id) return
  const api = getPipApi()
  if (!api) return // Keep native YouTube navigation when Document PiP is unsupported.

  // requestWindow must happen in this trusted click, without awaiting messages.
  let promise: Promise<PipPage>
  try {
    promise = api.requestWindow({ width: 500, height: 340 })
  } catch { return }
  event.preventDefault()
  event.stopImmediatePropagation()
  busy = true
  void promise.then((pip) => {
    const doc = pip.document
    doc.title = "MiniView · YouTube"
    doc.documentElement.style.cssText = "margin:0;background:#0c0c10;color:#fff;height:100%"
    doc.body.style.cssText = "margin:0;display:flex;flex-direction:column;height:100vh;background:#0c0c10;color:white;font:12px system-ui;overflow:hidden"
    const iframe = doc.createElement("iframe")
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&playsinline=1`
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"
    iframe.referrerPolicy = "strict-origin-when-cross-origin"
    iframe.title = "YouTube 영상 재생"
    iframe.style.cssText = "display:block;width:100%;flex:1;min-height:220px;border:0;background:#000"
    const footer = doc.createElement("div")
    footer.style.cssText = "display:flex;gap:10px;align-items:center;justify-content:space-between;min-height:49px;padding:0 12px;border-top:1px solid #30303b;background:#191921"
    const note = doc.createElement("span")
    note.textContent = "재생이 안 되면 원본에서 보기 →"
    note.style.cssText = "color:#c4c4d0"
    const link = doc.createElement("a")
    link.href = `https://www.youtube.com/watch?v=${id}`
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    link.textContent = "YouTube에서 보기 ↗"
    link.style.cssText = "color:#cbc2ff;font-weight:700;white-space:nowrap"
    footer.append(note, link)
    doc.body.replaceChildren(iframe, footer)
  }).catch(() => {
    // If PiP permission/user activation is denied, continue normal navigation.
    location.assign(anchor.href)
  }).finally(() => { busy = false })
}

function main(): void {
  // Isolate interaction to popup launched by MiniView; don't hijack ordinary YouTube tabs.
  void chrome.runtime.sendMessage({ type: "MINIVIEW_CHECK_WINDOW" }).then((result: { ok?: boolean }) => {
    inDedicatedWindow = result?.ok === true
    if (inDedicatedWindow) document.addEventListener("click", interceptNativeResultClick, true)
    showToolbar()
  }).catch(showToolbar)
  void chrome.storage.local.get(AUTO_KEY).then((items) => {
    autoPipEnabled = items[AUTO_KEY] !== false
  })
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && AUTO_KEY in changes) autoPipEnabled = changes[AUTO_KEY].newValue !== false
  })
}
if (document.documentElement) main()
else document.addEventListener("DOMContentLoaded", main, { once: true })
