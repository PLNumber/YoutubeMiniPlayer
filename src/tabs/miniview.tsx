import { useEffect, useRef, useState } from "react"
import { requestVideoDocumentPip, supportsDocumentPip } from "../services/documentPip"
import { searchVideos, type VideoResult } from "../services/youtubeSearch"
import { getYouTubeVideoId, youtubeWatchUrl } from "../services/videoId"
import "./miniview.css"

const KEY_SETTING = "miniview_youtube_api_key"
const suggestions = ["음악", "공부", "로파이", "풍경"]

function Icon({ name, size = 19 }: { name: "search" | "pip" | "play" | "settings" | "external" | "check" | "link" | "arrow"; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.85, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  const paths: Record<typeof name, React.ReactNode> = {
    search: <><circle cx="10.7" cy="10.7" r="7.3"/><path d="m16 16 5 5"/></>,
    pip: <><rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M13 13h6v5h-6z"/></>,
    play: <path d="m9 6 10 6-10 6V6z"/>,
    settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="#222536"/><circle cx="15" cy="17" r="2" fill="#222536"/></>,
    external: <><path d="M13 4h7v7M20 4l-9 9"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></>,
    check: <path d="m4 12 5 5 11-11"/>,
    link: <><path d="m10 13 4-4"/><path d="M9 6H7a4 4 0 0 0 0 8h3M15 18h2a4 4 0 0 0 0-8h-3"/></>,
    arrow: <path d="m5 12 14 0-5-5m5 5-5 5"/>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>
}

export default function MiniView() {
  const [apiKey, setApiKey] = useState("")
  const [draftKey, setDraftKey] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<VideoResult[]>([])
  const [selected, setSelected] = useState<VideoResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [pipStatus, setPipStatus] = useState("ready")
  const [lastSearch, setLastSearch] = useState("")
  const currentRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    void chrome.storage.local.get(KEY_SETTING).then((data) => {
      if (typeof data[KEY_SETTING] === "string") {
        setApiKey(data[KEY_SETTING]); setDraftKey(data[KEY_SETTING])
      }
    }).catch(() => setStatus("설정을 읽지 못했습니다. 확장 프로그램을 다시 실행하세요."))
    return () => currentRequest.current?.abort()
  }, [])

  const directId = getYouTubeVideoId(query)

  async function saveKey() {
    try {
      const value = draftKey.trim()
      await chrome.storage.local.set({ [KEY_SETTING]: value })
      setApiKey(value)
      setStatus(value ? "API 키를 이 브라우저의 확장 프로그램 저장소에 저장했어요." : "API 키를 지웠어요.")
      setShowSettings(false)
    } catch {
      setStatus("API 키 저장에 실패했어요.")
    }
  }

  async function handleSearch(searchTerm?: string) {
    const term = (searchTerm ?? query).trim()
    if (!term) { setStatus("검색어 또는 유튜브 영상 주소를 입력해 주세요."); return }
    setQuery(term)
    currentRequest.current?.abort()
    const id = getYouTubeVideoId(term)
    if (id) {
      const direct: VideoResult = {
        id,
        title: "붙여넣은 YouTube 영상",
        channel: "직접 입력한 영상 링크",
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: ""
      }
      setResults([direct]); setSelected(direct); setLastSearch("영상 링크")
      setStatus("영상 링크를 확인했어요. 결과를 눌러 PiP를 실행해 보세요.")
      return
    }
    if (!apiKey) {
      setShowSettings(true)
      setStatus("실제 YouTube 검색은 API 키가 필요합니다. 설정에서 키를 입력하거나 영상 주소를 붙여넣으세요.")
      return
    }
    const controller = new AbortController()
    currentRequest.current = controller
    setLoading(true); setStatus(""); setLastSearch(term)
    try {
      const items = await searchVideos(term, apiKey, controller.signal)
      if (controller.signal.aborted) return
      setResults(items)
      setSelected(null)
      if (!items.length) setStatus("검색 결과가 없어요. 다른 키워드로 다시 검색해 주세요.")
    } catch (error) {
      if (controller.signal.aborted) return
      setStatus(error instanceof Error ? error.message : "검색 중 알 수 없는 오류가 발생했어요.")
    } finally {
      if (currentRequest.current === controller) setLoading(false)
    }
  }

  function handleSelect(video: VideoResult) {
    setSelected(video)
    setStatus("")
    setPipStatus("opening")
    if (!supportsDocumentPip()) {
      setPipStatus("fallback")
      setStatus("이 브라우저에서는 Document PiP를 사용할 수 없어요. 아래 'YouTube에서 열기'를 이용해 주세요.")
      return
    }
    // Direct invocation from the React onClick; preserve transient user activation.
    try {
      const operation = requestVideoDocumentPip(video)
      void operation.then(() => {
        setPipStatus("open")
        setStatus("PiP 창을 열었어요. YouTube가 재생을 막거나 153 오류가 뜨면 'YouTube에서 열기'를 이용하세요. 이 MiniView 탭은 닫지 마세요.")
      }).catch((error: unknown) => {
        setPipStatus("fallback")
        setStatus(`PiP 실행 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}. 유튜브 원본 페이지에서 PiP 버튼으로 재시도할 수 있어요.`)
      })
    } catch (error) {
      setPipStatus("fallback")
      setStatus(error instanceof Error ? error.message : "PiP 기능을 시작하지 못했어요.")
    }
  }

  function openYouTube(video: VideoResult) {
    void chrome.tabs.create({ url: youtubeWatchUrl(video.id) }).catch(() => {
      setStatus("유튜브 영상 탭을 열 수 없어요.")
    })
  }

  function openNativeSearch() {
    const q = query.trim()
    void chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` })
  }

  return <div className="app-shell">
    <div className="windowbar">
      <div className="traffic" aria-hidden="true"><i/><i/><i/></div>
      <div className="brand"><div className="brand-icon"><Icon name="pip" size={16}/></div> MiniView <span> / YouTube</span></div>
      <button className="mini-settings" type="button" onClick={() => setShowSettings(v => !v)} aria-expanded={showSettings}><Icon name="settings" size={17}/> API 설정</button>
    </div>
    <div className="layout">
      <main className="main-panel">
        <div className="eyebrow">YOUR FLOATING PLAYER</div>
        <h1>영상은 작게.<br/><em>집중은 깊게.</em></h1>
        <p className="subtitle">원하는 영상을 검색하고 선택하세요.<br/>다른 작업을 하면서 PiP 창으로 계속 시청할 수 있어요.</p>
        <form className="searchbar" onSubmit={e => {e.preventDefault(); void handleSearch()}}>
          <Icon name="search" size={19}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="YouTube 검색 또는 영상 링크 붙여넣기" aria-label="YouTube 검색 또는 영상 URL" spellCheck={false}/>
          <button type="submit" disabled={loading}>{loading ? "검색 중..." : directId ? "링크 확인" : "검색"}</button>
        </form>
        <div className="hints">{suggestions.map(tag => <button type="button" className="hint-pill" key={tag} onClick={() => void handleSearch(tag)}>{tag}</button>)}<span>또는 영상 링크 바로 입력</span></div>
        {showSettings && <div className="settings-card">
          <div className="settings-heading"><strong>YouTube Data API v3</strong><button className="simple-close" onClick={() => setShowSettings(false)}>닫기 ×</button></div>
          <p>검색 결과를 앱 안에서 표시하려면 본인의 Google Cloud API 키가 필요해요. 영상 링크만 사용한다면 입력하지 않아도 됩니다.</p>
          <input type="password" value={draftKey} onChange={e => setDraftKey(e.target.value)} placeholder="YouTube Data API 키" aria-label="YouTube Data API 키" autoComplete="off"/>
          <div className="settings-bottom"><a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer">API 활성화 안내 ↗</a><button className="save-key" type="button" onClick={() => void saveKey()}>설정 저장</button></div>
          <small>키는 이 브라우저의 확장 저장소에 저장되며 사용자에게 숨길 수 있는 비밀 키가 아닙니다. 공개 배포 시에는 별도 인증·키 관리 설계가 필요해요.</small>
        </div>}
        <div className="section-title"><strong>{lastSearch ? "검색 결과" : "영상 찾아보기"}</strong><span>{lastSearch ? `${results.length}개 결과 · ${lastSearch}` : "선택해서 미니 플레이어 실행"}</span></div>
        <div className="results" aria-live="polite">
          {results.length ? results.map((video) => <button key={video.id} type="button" onClick={() => handleSelect(video)} className={`result ${selected?.id === video.id ? "active" : ""}`}>
            <div className="thumb">{video.thumb ? <img src={video.thumb} alt=""/> : <Icon name="play" size={29}/>}<span><Icon name="play" size={17}/></span></div>
            <div className="video-details"><strong>{video.title}</strong><small>{video.channel}</small><span>선택하여 PiP 실행 ↗</span></div><div className="video-action"><Icon name="pip" size={18}/></div>
          </button>) : <div className="empty">
            <div className="empty-icon"><Icon name="search" size={24}/></div>
            <strong>{loading ? "유튜브에서 검색 중..." : "보고 싶은 영상을 찾아보세요"}</strong>
            <p>{loading ? "잠시 기다려 주세요." : "위에서 영상 URL을 붙여넣거나 API 키를 등록해 검색 결과를 불러오세요."}</p>
            {!apiKey && <button className="text-link" type="button" onClick={() => setShowSettings(true)}>검색용 API 키 설정하기 →</button>}
          </div>}
        </div>
        {!!status && <div className="status" role="status">{status}</div>}
        <div className="secondary-row"><button onClick={openNativeSearch} type="button"><Icon name="external" size={16}/> YouTube에서 직접 검색</button><span>검색 API가 없어도 영상 링크로 PiP 시도 가능</span></div>
      </main>
      <aside className="side-panel">
        <div className="side-heading"><strong>NOW SELECTED</strong><span>{pipStatus === "open" ? "PiP 실행 요청됨" : "Mini Player"}</span></div>
        <div className="preview-card"><div className="preview-screen">
          {selected?.thumb ? <img src={selected.thumb} alt="선택 영상 썸네일"/> : <div className="preview-gradient"><span>MiniView</span><Icon name="pip" size={48}/></div>}
          {!selected && <span className="ready">READY TO FLOAT</span>}
        </div>
        <div className="preview-info"><strong>{selected?.title || "어떤 영상을 띄워볼까요?"}</strong><small>{selected?.channel || "원하는 영상을 선택해 주세요."}</small></div>
        <div className="preview-actions">
          <button className="primary-button" disabled={!selected} type="button" onClick={() => selected && handleSelect(selected)}><Icon name="pip" size={18}/> PiP 실행</button>
          <button className="secondary-button" disabled={!selected} type="button" onClick={() => selected && openYouTube(selected)}><Icon name="external" size={16}/> YouTube에서 열기</button>
        </div></div>
        <div className="howto"><strong>HOW IT WORKS</strong><div><b>01</b><span><strong>찾기</strong><small>검색하거나 영상 URL 붙여넣기</small></span></div><div><b>02</b><span><strong>선택하기</strong><small>결과 클릭 시 실제 Document PiP 시도</small></span></div><div><b>03</b><span><strong>재생하기</strong><small>재생이 안 되면 원본 유튜브에서 PiP 사용</small></span></div></div>
        <div className="disclaimer">Document PiP의 영상은 YouTube 공식 임베드를 사용해요. 일부 영상은 임베드가 제한되거나 153 오류가 발생할 수 있어요. 원본 MiniView 탭을 닫으면 PiP도 종료됩니다.</div>
      </aside>
    </div>
    <footer className="footer">MiniView · 기능 검증용 v3 <span>검색 결과는 공식 YouTube Data API 사용 · 광고/플레이어 조작 없음</span></footer>
  </div>
}
