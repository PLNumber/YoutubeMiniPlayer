# MiniView v3 — v2 원본 프로젝트 패치 방법

**주의: 전체 코드를 복구할 수 있도록 원본 프로젝트를 먼저 백업하세요.**

1. VS Code에서 *빌드 폴더가 아닌* 기존 `youtube-mini-player` **소스 프로젝트**를 엽니다.
2. 변경 파일 ZIP을 풀고 이 폴더의 `package.json`, `package-lock.json`, `locales/`, `src/`를 기존 프로젝트 최상위 폴더에 복사/덮어쓰기 합니다.
3. **반드시 삭제:** `src/popup.tsx` (v2 팝업이 그대로 표시되는 걸 막기 위해서).
4. v2에서만 사용한 파일(미사용, 가능하면 삭제):
   - `src/viewmodels/usePopupViewModel.ts`
   - `src/services/chromeStorageService.ts`
   - `src/services/chromeWindowService.ts`
   - `src/services/pipService.ts`
   - `src/services/pipTabService.ts`
   - `src/services/radioTabService.ts`
   - `src/services/youtubeService.ts`
   - `src/constants/storageKeys.ts`
   - `src/i18n/popupText.ts`
   - `src/types/playerMode.ts`
   - `src/types/popupLocaleText.ts`
5. `npm install`, `npm run dev`
6. `chrome://extensions`에서 해당 확장 프로그램 **다시 로드**를 누르고 YouTube 영상 페이지도 새로고침합니다.
7. 아이콘/`Alt+Y`로 MiniView 새 탭을 열고 먼저 **영상 URL 붙여넣기**부터 시험해 주세요.

빌드 결과물에 덮어쓰기하지 마세요. 빌드 실패 시 먼저 `npm install`을 깨끗한 플랫폼에서 실행해 의존성을 복구해 주세요.

## 변경 파일 구성

- 수정: `package.json`, `package-lock.json`, `locales/en/messages.json`, `locales/ko/messages.json`, `src/background.ts`, `src/contents/youtube-pip.ts`
- 신규: `src/services/videoId.ts`, `src/services/youtubeSearch.ts`, `src/services/documentPip.ts`, `src/tabs/miniview.tsx`, `src/tabs/miniview.css`
- 삭제: `src/popup.tsx` 및 기타 이전 v2 전용 코드 (위 목록)

## 기능 검증 체크

- [ ] 툴바 아이콘 클릭으로 MiniView **크롬 탭**이 열린다.
- [ ] URL 입력/`링크 확인` 시 썸네일이 표시된다.
- [ ] 영상 결과 클릭 시 PiP 창이 열리는지 확인한다.
- [ ] PiP 내부의 실제 YouTube 재생이 동작하는지 확인한다 (실패하면 오류 메시지 기록).
- [ ] 원본 영상 탭으로 이동한 후 `MiniView PiP` 버튼이 실제 영상만 분리하는지 확인한다.
- [ ] API 키 설정 후 검색 결과가 표시되는지 확인한다.
