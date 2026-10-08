# YouTube Mini Player — 기능 개발 1차 버전 (A + B)

Chrome 확장 프로그램. **아직 웹 스토어 제출용 최종본이 아닙니다.**

- **A / PiP**: YouTube 영상 페이지(`/watch`, `/shorts`, `/live`)에서 우측 하단의 `PiP 미니 플레이어` 버튼을 눌러 동영상을 항상 위에 표시합니다. 탭은 열어둬야 합니다.
- **B / 작은 창**: 검색 결과와 YouTube 홈페이지를 일반 팝업 창으로 열고 기존 YouTube 팝업을 재사용합니다. 일반 브라우저 팝업은 항상 위에 고정되지 않습니다.
- `Alt + Y`는 확장 프로그램 팝업을 엽니다. Chrome 단축키 설정 및 사이트 정책 등에 따라 다를 수 있습니다.
- 한국어/영어 팝업 UI와 모드 설정 저장을 지원합니다.

## 설치 / 테스트 (Windows PowerShell 등)

```bash
npm install
npm run dev
```

1. Chrome의 `chrome://extensions`에서 **개발자 모드**를 켭니다.
2. **압축해제된 확장 프로그램을 로드합니다** → `build/chrome-mv3-dev`를 선택합니다.
3. YouTube 영상 페이지를 **새로고침**하고 재생합니다.
4. 화면 우측 하단의 `PiP 미니 플레이어` 버튼을 클릭합니다. (PiP에서 나가도 원래 영상 페이지는 유지됩니다.)
5. 확장 프로그램 팝업에서 **B · 작은 창**을 선택하고 검색 또는 YouTube 열기를 눌러 봅니다.
6. **A · PiP**를 선택하면 검색이나 열기는 일반 브라우저 탭으로 작동하며, 영상 페이지에서 버튼을 클릭해야 PiP가 시작됩니다.

## 빌드

```bash
npm run build
```

`build/chrome-mv3-prod`가 생성됩니다. 웹 스토어 제출은 전체 테스트 및 권한 검토 후 진행합니다.

## 수정 / 추가 파일

| 변경 | 파일 |
| --- | --- |
| 신규 | `src/types/playerMode.ts` |
| 신규 | `src/services/pipService.ts` |
| 신규 | `src/contents/youtube-pip.ts` |
| 교체 | `src/popup.tsx` |
| 교체 | `src/viewmodels/usePopupViewModel.ts` |
| 교체 | `src/services/chromeStorageService.ts` |
| 교체 | `src/services/chromeWindowService.ts` |
| 교체 | `src/types/popupLocaleText.ts` |
| 교체 | `src/i18n/popupText.ts` |
| 교체 | `tsconfig.json` |
| 교체 | `locales/en/messages.json`, `locales/ko/messages.json` |

`package.json`, `src/background.ts`, `src/services/youtubeService.ts`, `src/constants/storageKeys.ts`는 그대로 둡니다. 기존 소스 삭제는 필요 없습니다.

## 주의

- PiP 실행은 페이지의 **실제 클릭**이 필요합니다. 외부 확장 팝업에서 자동으로 실행하지 않습니다.
- YouTube 또는 브라우저 정책으로 PiP가 제한되거나 영상 재생이 준비되지 않은 경우 실행되지 않을 수 있습니다.
- B 모드 팝업이 YouTube를 벗어나 다른 사이트로 이동했다면 해당 창은 건드리지 않고 새 창을 만듭니다.
- 원본 ZIP 전체(특히 `.git`, `node_modules`, 개인정보 문서)를 그대로 공유하거나 스토어에 업로드하지 마세요.
- 이 프로젝트는 YouTube/Google의 공식 제품이 아닙니다.
