/**
 * Keeps playback inside the ORIGINAL visible YouTube page and switches to a
 * different tab. This does not extract audio, hide an embedded player, or use
 * an MV3 service worker to play media. The user must start playback on YouTube.
 */
export async function continueAudioInBackground(sourceTab: chrome.tabs.Tab | undefined): Promise<void> {
  if (!sourceTab?.id || sourceTab.windowId === undefined) {
    throw new Error("YouTube 탭을 확인하지 못했습니다.")
  }

  const tabs = await chrome.tabs.query({ windowId: sourceTab.windowId })
  const otherTabs = tabs
    .filter((tab) => tab.id !== undefined && tab.id !== sourceTab.id)
    .sort((a, b) => {
      const aIsYouTube = Number(Boolean(a.url && /^https:\/\/(www\.|m\.|music\.)?youtube\.com\//.test(a.url)))
      const bIsYouTube = Number(Boolean(b.url && /^https:\/\/(www\.|m\.|music\.)?youtube\.com\//.test(b.url)))
      return aIsYouTube - bIsYouTube || (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0)
    })

  if (otherTabs[0]?.id !== undefined) {
    await chrome.tabs.update(otherTabs[0].id, { active: true })
    return
  }

  const window = await chrome.windows.get(sourceTab.windowId)
  if (window.type === "normal") {
    await chrome.tabs.create({ windowId: sourceTab.windowId, active: true })
    return
  }

  const normalWindows = await chrome.windows.getAll({ windowTypes: ["normal"], populate: true })
  const normal = normalWindows.find((w) => w.id !== undefined)
  if (normal?.id !== undefined) {
    const target = normal.tabs?.find((tab) => tab.id !== undefined)
    if (target?.id !== undefined) await chrome.tabs.update(target.id, { active: true })
    await chrome.windows.update(normal.id, { focused: true })
    return
  }

  await chrome.windows.create({ type: "normal", focused: true })
}
