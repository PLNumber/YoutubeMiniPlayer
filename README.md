# Quick Search for YouTube

Quick Search for YouTube는 검색어를 입력하면 YouTube 검색 결과를 작은 팝업 창으로 빠르게 열 수 있는 Chrome 확장 프로그램입니다.

복잡한 API 연동 없이, 사용자가 입력한 검색어를 YouTube 검색 URL로 변환하여 별도의 작은 창에서 열어줍니다.

## 주요 기능

- 검색어 입력 후 YouTube 검색 결과 열기
- YouTube 홈페이지를 작은 팝업 창으로 열기
- Alt + Y 단축키로 확장 프로그램 팝업 열기
- 단축키 사용 여부 ON/OFF 설정
- 이미 열린 YouTube 팝업 창이 있으면 새 창을 계속 만들지 않고 기존 창 재사용
- 한국어/영어 UI 지원
- YouTube Data API, API Key, 외부 백엔드 서버 미사용

## 사용 방법

1. Chrome 확장 프로그램 아이콘을 클릭합니다.
2. 검색어를 입력합니다.
3. 검색 버튼을 누르거나 Enter 키를 입력합니다.
4. YouTube 검색 결과가 작은 팝업 창으로 열립니다.
5. 유튜브 열기 버튼을 누르면 YouTube 홈페이지가 작은 팝업 창으로 열립니다.

## 단축키

기본 단축키는 Alt + Y 입니다.

확장 프로그램 팝업에서 단축키 사용 여부를 켜거나 끌 수 있습니다.

## 저장되는 정보

이 확장 프로그램은 단축키 사용 여부 설정만 브라우저 로컬 저장소에 저장합니다.

사용자가 입력한 검색어를 개발자 서버로 전송하지 않으며, 별도의 외부 백엔드 서버나 YouTube Data API를 사용하지 않습니다.

단, YouTube 페이지를 여는 과정에서는 YouTube 서비스가 로드되며, 이때 YouTube 및 Google의 정책이 적용될 수 있습니다.

## 기술 스택

- Plasmo
- React
- TypeScript
- Chrome Extension Manifest V3

## 설치 및 실행

    npm install
    npm run dev

## 빌드

    npm run build

## 패키징

    npm run package

패키징 후 생성된 zip 파일을 Chrome Web Store Developer Dashboard에 업로드할 수 있습니다.

## 주의사항

이 확장 프로그램은 YouTube 또는 Google과 공식적으로 제휴하거나 보증받은 제품이 아닙니다.

YouTube는 Google LLC의 상표입니다.
