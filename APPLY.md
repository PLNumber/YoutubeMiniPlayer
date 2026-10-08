# MiniView v3.2 (API 키 없는 YouTube + PiP 실험)

이 ZIP은 **기존 MiniView v3.1 프로젝트에 덮어쓰는 변경 파일**입니다. `node_modules`, `.git`, 사용자 개인 자료는 포함하지 않았습니다.

## 적용

1. Git 브랜치 `fix/miniview-v3-launcher`에서 기존 작업을 보존/백업하세요.
2. 개발 서버를 종료하고 ZIP을 프로젝트 최상위에 풀어 같은 경로에 덮어씁니다.
3. 기존 API 전용 파일 두 개를 직접 삭제하세요:

```bash
rm -f src/services/youtubeSearch.ts src/services/documentPip.ts
```

4. `npm run check` 및 `npm run dev`를 VS Code에서 실행합니다.
5. Chrome `chrome://extensions`의 확장 프로그램을 새로고침하고, 이전 MiniView 창은 닫았다가 다시 실행하세요.

## 테스트 (반드시 Chrome에서)

1. MiniView에서 검색어 입력 → `검색` 버튼 → 같은 420×620 창에서 실제 YouTube 검색 페이지가 열리는지 확인.
2. 검색 결과의 영상 제목/썸네일 클릭 → YouTube **출처의 Document PiP** 창이 열리는지 확인.
3. PiP의 공식 YouTube 임베드 영상이 실제 재생되는지 확인. `오류 153`, 자동재생 차단, 임베드 제한은 여전히 가능함.
4. 실패 시 YouTube 원본 영상으로 이동 → 영상 화면의 `◩ PiP로 보기` 클릭.
5. MiniView 창을 닫으면 Document PiP도 닫힐 수 있음 (Chrome 설계 제약).

## 특징/제약

- YouTube Data API 없이 원본 YouTube 검색·로그인 사용.
- 검색 결과의 선택된 링크 하나만 처리하며, 검색 결과 스크래핑은 하지 않음.
- **한 번의 영상 클릭으로 PiP 창 열기를 시도**하지만 Chrome 권한과 YouTube 정책으로 인한 재생 실패 가능성을 제거하지는 못함.
- YouTube 광고/지역 제한/임베드 제한을 우회하지 않음.
- 성공 여부를 확인하기 전에는 Chrome Web Store용으로 배포하지 마세요.

## 파일 변경

교체: `src/background.ts`, `src/tabs/miniview.tsx`, `src/tabs/miniview.css`, `src/contents/youtube-pip.ts`, `package.json`, `package-lock.json`

유지: `src/services/videoId.ts`

삭제: `src/services/youtubeSearch.ts`, `src/services/documentPip.ts`

GitHub: 현재 브랜치에서만 테스트하고 정상 확인 전 `main`에 병합하지 않습니다.
