# MiniView v3.1 — 420×620 독립 검색 창 패치

## 필수 안내

- 기준: v3가 이미 적용되어 있고 구형 `src/popup.tsx`가 삭제된 `fix/miniview-v3-launcher` 브랜치.
- 기능: 확장 아이콘/Alt+Y → 별도 **Chrome 팝업 창**(외곽 크기 420×620), 기존 검색 창 재사용, 영상 선택, 별도의 PiP 실행 버튼.
- Chrome 팝업은 **항상 위에 있는 PiP와 다릅니다**. PiP 실행 후 검색 창을 닫으면 Document PiP도 종료됩니다.
- YouTube 공식 임베드의 실제 재생은 Chrome/YouTube 환경에 따라 막힐 수 있습니다(오류 153 등). **현재 코드 검사 및 모의 테스트를 통과했으나 실제 YouTube 영상 재생 성공은 미검증**입니다.
- API 키 없이 YouTube 영상 URL 붙여넣기는 가능. 텍스트 검색은 YouTube Data API v3 키가 필요합니다.

## 교체 파일

- `src/background.ts` — 일반 Chrome 탭 대신 `chrome.windows.create({ type: 'popup', width: 420, height: 620 })`; 기존 창 재사용
- `src/tabs/miniview.tsx` — 컴팩트 검색/결과/선택/실행 UI, 선택과 PiP 실행 분리
- `src/tabs/miniview.css` — 420px 독립 창에 맞춘 레이아웃 및 내부 스크롤
- `src/services/documentPip.ts` — PiP 기본 창 크기를 500×340으로 조정
- `package.json`, `package-lock.json` — 버전 3.1.0 표시

### 삭제할 소스 파일

**없음**. 기존에 v2 정리 스크립트를 실행해 `src/popup.tsx`를 삭제했다면 반복해서 삭제하지 마세요.
`reset-miniview-v3.1.sh`는 캐시만 지우는 선택적 스크립트이며 소스와 Git 데이터는 삭제하지 않습니다.

## 적용 (Windows Git Bash)

1. VS Code에서 `youtube-mini-player` 프로젝트를 연 뒤 현재 브랜치 확인: `git branch --show-current`.
2. 프로젝트 폴더를 백업합니다. 이 ZIP의 폴더/파일을 **프로젝트 최상위 폴더에 덮어쓰기**합니다. `build/chrome-mv3-dev`에 복사하지 마세요.
3. `bash reset-miniview-v3.1.sh` (미리보기) → 필요 시 `bash reset-miniview-v3.1.sh --apply` (개발 빌드 캐시만 삭제).
4. `npm install && npm run check && npm run dev`
5. `chrome://extensions` → 기존 확장 프로그램 **새로고침**. 로드 위치가 해당 프로젝트의 `build/chrome-mv3-dev`인지 확인.
6. 이전 v3 대형 탭은 수동으로 닫고, 확장 프로그램 아이콘 클릭 → **Chrome의 독립된 420×620 창** 열리는지 확인. 실제 표시 영역은 윈도우 프레임 높이만큼 작습니다.
7. 영상 URL을 넣고 **확인 → 영상 선택 → 하단의 PiP로 재생**을 누릅니다. PiP 창만 열리고 재생이 안 되면 하단 **원본 영상 열기**를 눌러 YouTube 재생 페이지의 `MiniView PiP` 버튼으로 확인합니다.

## GitHub 작업

성공할 때까지 `main`은 수정하지 않고 현재 `fix/miniview-v3-launcher` 브랜치를 사용하세요.

```bash
git status -sb
git add src/background.ts src/tabs/miniview.tsx src/tabs/miniview.css src/services/documentPip.ts package.json package-lock.json PATCH-README.md reset-miniview-v3.1.sh
git diff --cached --name-status
git diff --cached --check
# 검토 후
git commit -m "feat: open MiniView in compact search window"
git push -u origin fix/miniview-v3-launcher
```

`.gitignore`에 빌드 캐시가 있으니 `build/` 및 `.plasmo/`는 커밋하지 않습니다. 민감정보/API 키가 커밋에 들어 있지 않은지 확인하세요.
