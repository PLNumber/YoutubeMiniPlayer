import { useEffect, useState, type FormEvent } from "react"
import { getYouTubeVideoId, youtubeWatchUrl } from "../services/videoId"
import "./miniview.css"

const LEGACY_KEY = "miniview_youtube_api_key"
const AUTO_KEY = "miniview_auto_pip_enabled"

function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

export default function MiniView() {
  const [query, setQuery] = useState("")
  const [autoPip, setAutoPip] = useState(true)
  const [error, setError] = useState("")
  const videoId = getYouTubeVideoId(query)

  useEffect(() => {
    document.title = "MiniView — YouTube"
    // Remove an API key persisted by older development builds.
    void chrome.storage.local.remove(LEGACY_KEY)
    void chrome.storage.local.get(AUTO_KEY).then((values) => {
      if (typeof values[AUTO_KEY] === "boolean") setAutoPip(values[AUTO_KEY])
    })
  }, [])

  function changeAutoPip(enabled: boolean): void {
    setAutoPip(enabled)
    void chrome.storage.local.set({ [AUTO_KEY]: enabled })
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const input = query.trim()
    if (!input) { setError("검색어 또는 YouTube 영상 링크를 입력해 주세요."); return }
    setError("")
    const url = videoId ? youtubeWatchUrl(videoId) : youtubeSearchUrl(input)
    // Open REAL YouTube within this same 420x620 dedicated popup window.
    // This preserves the user's Chrome/YouTube login and avoids API scraping.
    void chrome.tabs.getCurrent().then((tab) => {
      if (tab?.id === undefined) throw new Error("MiniView 탭을 찾을 수 없어요.")
      return chrome.tabs.update(tab.id, { url })
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "YouTube를 열 수 없어요.")
    })
  }

  return <main className="app-shell">
    <div className="topbar">
      <div className="brand-icon" aria-hidden="true">▣</div>
      <div className="brand">MiniView <span>for YouTube</span></div>
      <div className="mode">NO API</div>
    </div>
    <section className="hero">
      <div className="eyebrow">YOUR FLOATING VIDEO COMPANION</div>
      <h1>영상은 작게.<br/><em>집중은 깊게.</em></h1>
      <p>로그인된 유튜브에서 검색하고,<br/>원하는 영상을 PiP로 띄워보세요.</p>
    </section>
    <form className="searchbar" onSubmit={submit}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.7" cy="10.7" r="7.3"/><path d="m16 16 5 5"/></svg>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="음악 검색 또는 YouTube 주소" autoFocus aria-label="YouTube 검색"/>
      <button type="submit">{videoId ? "영상 열기" : "검색"}</button>
    </form>
    <div className="tags">{["음악", "lofi", "공부", "라이브"].map((s) => <button type="button" key={s} onClick={() => setQuery(s)}>{s}</button>)}</div>
    <section className="settings">
      <div className="row"><div><strong>영상 선택 즉시 PiP 시도</strong><p>유튜브 검색 결과를 클릭하면 PiP 창을 엽니다.</p></div>
        <label className="switch"><input type="checkbox" checked={autoPip} onChange={(e) => changeAutoPip(e.target.checked)} aria-label="선택 즉시 PiP 시도"/><span/></label>
      </div>
      <div className="note"><span>ⓘ</span><p>실험 기능이에요. Chrome 설정·자동재생 제한 또는 영상별 임베드 정책에 따라 영상이 바로 재생되지 않을 수 있어요. 그때는 원본 유튜브 화면의 <b>MiniView PiP</b> 버튼을 이용하세요.</p></div>
    </section>
    {error && <div className="error" role="alert">{error}</div>}
    <footer>Google API 키 없이 이용 · YouTube에서 직접 재생</footer>
  </main>
}
