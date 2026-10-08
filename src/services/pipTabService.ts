/** A(PiP) 모드는 새 창을 열지 않고, 이미 열려 있는 YouTube 영상 탭으로 이동합니다. */
export function isYouTubeVideoUrl(value?: string): boolean {
  if (!value) return false

  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.hostname !== "www.youtube.com") {
      return false
    }

    return (
      (url.pathname === "/watch" && url.searchParams.has("v")) ||
      url.pathname.startsWith("/shorts/") ||
      url.pathname.startsWith("/live/")
    )
  } catch {
    return false
  }
}

export async function focusYouTubeVideoTab(): Promise<boolean> {
  const tabs = await chrome.tabs.query({ url: "https://www.youtube.com/*" })
  const videoTabs = tabs.filter((tab) => tab.id !== undefined && isYouTubeVideoUrl(tab.url))

  // 재생 중인 영상(소리 출력)을 우선하고, 그다음 활성 탭을 선택합니다.
  videoTabs.sort((a, b) =>
    Number(Boolean(b.audible)) - Number(Boolean(a.audible)) ||
    Number(Boolean(b.active)) - Number(Boolean(a.active)) ||
    (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0)
  )

  const target = videoTabs[0]
  if (!target || target.id === undefined) return false

  await chrome.tabs.update(target.id, { active: true })
  await chrome.windows.update(target.windowId, { focused: true })
  return true
}
