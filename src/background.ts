const LAUNCHER_PATH = "tabs/miniview.html"

async function launchMiniView() {
  const target = chrome.runtime.getURL(LAUNCHER_PATH)
  const existing = await chrome.tabs.query({ url: `${chrome.runtime.getURL("tabs/")}*` })
  const found = existing.find((tab) => tab.url?.split("?")[0] === target && typeof tab.id === "number")
  if (found?.id !== undefined) {
    await chrome.tabs.update(found.id, { active: true })
    if (found.windowId !== undefined) await chrome.windows.update(found.windowId, { focused: true })
  } else {
    await chrome.tabs.create({ url: target })
  }
}

// No default_popup: toolbar click launches a persistent extension tab.
chrome.action.onClicked.addListener(() => {
  void launchMiniView().catch((error) => console.error("MiniView 열기 실패:", error))
})
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-youtube-mini-player") {
    void launchMiniView().catch((error) => console.error("MiniView 단축키 실행 실패:", error))
  }
})
