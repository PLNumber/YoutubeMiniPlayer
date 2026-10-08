import { youtubeWatchUrl } from "./videoId"
import type { VideoResult } from "./youtubeSearch"

type DocumentPipWindow = Window & { document: Document }
type DocumentPipApi = { requestWindow(options: { width: number; height: number }): Promise<DocumentPipWindow> }

export function supportsDocumentPip(): boolean {
  return typeof (window as Window & { documentPictureInPicture?: DocumentPipApi }).documentPictureInPicture?.requestWindow === "function"
}

function makeButton(doc: Document, label: string, click: () => void): HTMLButtonElement {
  const button = doc.createElement("button")
  button.textContent = label
  button.type = "button"
  button.style.cssText = "border:1px solid #474758;background:#282a38;color:#f3f1ff;border-radius:9px;padding:7px 12px;font:600 12px system-ui;cursor:pointer;"
  button.addEventListener("click", click)
  return button
}

/** IMPORTANT: Invoke this function synchronously in the video selection click handler. */
export function requestVideoDocumentPip(video: VideoResult): Promise<DocumentPipWindow> {
  const api = (window as Window & { documentPictureInPicture?: DocumentPipApi }).documentPictureInPicture
  if (!api?.requestWindow) throw new Error("이 Chrome에서는 Document PiP를 지원하지 않아요.")
  // No await, fetch, chrome.storage calls before requestWindow: preserve user activation.
  const promise = api.requestWindow({ width: 500, height: 340 })
  return promise.then((pip) => {
    const doc = pip.document
    doc.title = `MiniView — ${video.title}`
    doc.documentElement.lang = "ko"
    doc.documentElement.style.cssText = "background:#12141d;color:#f4f4fa;width:100%;height:100%;"
    doc.body.style.cssText = "margin:0;padding:0;background:#12141d;color:#f4f4fa;font:12px system-ui;overflow:hidden;display:flex;flex-direction:column;height:100vh;"
    const frame = doc.createElement("iframe")
    frame.title = `${video.title} - YouTube 공식 플레이어`
    frame.src = `https://www.youtube.com/embed/${encodeURIComponent(video.id)}?autoplay=1&playsinline=1&rel=0`
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"
    frame.referrerPolicy = "strict-origin-when-cross-origin"
    frame.style.cssText = "width:100%;height:calc(100vh - 49px);min-height:240px;display:block;border:0;background:#000;flex:1;"
    // The official player is unobstructed; no overlay above the iframe.
    const footer = doc.createElement("div")
    footer.style.cssText = "flex:0 0 49px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;gap:12px;background:#191b26;border-top:1px solid #303444;"
    const title = doc.createElement("div")
    title.textContent = video.title
    title.title = video.title
    title.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-weight:650;"
    footer.append(title, makeButton(doc, "YouTube에서 열기 ↗", () => {
      // A legal fallback if a video forbids embedding or returns error 153.
      void chrome.tabs.create({ url: youtubeWatchUrl(video.id) })
    }))
    doc.body.replaceChildren(frame, footer)
    return pip
  })
}
