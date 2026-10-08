#!/usr/bin/env bash
# MiniView v3: remove only obsolete v2 source files and stale Plasmo outputs.
# Default: preview only. Pass --apply to actually delete.
set -euo pipefail

APPLY=false
PROJECT_DIR="."
usage() {
  cat <<'HELP'
MiniView v3 이전 버전 정리

사용법:
  bash cleanup-miniview-v3.sh                 # 미리보기: 삭제하지 않음
  bash cleanup-miniview-v3.sh --apply         # 백업 후 실제 정리
  bash cleanup-miniview-v3.sh --project DIR   # 다른 프로젝트 경로 검사
  bash cleanup-miniview-v3.sh --project DIR --apply

권장: 실행 전에 Git 작업 브랜치를 생성하고 변경 사항을 커밋하세요.
HELP
}
while (($#)); do
  case "$1" in
    --apply) APPLY=true; shift ;;
    --project)
      if (($# < 2)); then echo '오류: --project 다음에 경로를 넣어주세요.' >&2; exit 2; fi
      PROJECT_DIR="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "알 수 없는 옵션: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ ! -d "$PROJECT_DIR" ]]; then echo "프로젝트 디렉터리가 없습니다: $PROJECT_DIR" >&2; exit 2; fi
ROOT="$(cd "$PROJECT_DIR" && pwd -P)"
if [[ "$ROOT" == '/' || "$ROOT" == "$HOME" ]]; then
  echo '안전 검사 실패: 파일시스템 루트/홈을 프로젝트로 사용할 수 없습니다.' >&2
  exit 2
fi
# A wrong directory (especially a built extension folder) must not be touched.
for required in package.json src/background.ts src/tabs/miniview.tsx src/tabs/miniview.css; do
  if [[ ! -f "$ROOT/$required" ]]; then
    echo "안전 검사 실패: v3 소스 프로젝트 파일이 없습니다: $required" >&2
    exit 2
  fi
done
if ! grep -q 'tabs/miniview.html' "$ROOT/src/background.ts"; then
  echo '안전 검사 실패: 현재 background.ts가 MiniView v3 실행 코드가 아닙니다.' >&2
  exit 2
fi

OLD_SOURCES=(
  'src/popup.tsx'
  'src/viewmodels/usePopupViewModel.ts'
  'src/services/chromeStorageService.ts'
  'src/services/chromeWindowService.ts'
  'src/services/pipService.ts'
  'src/services/pipTabService.ts'
  'src/services/radioTabService.ts'
  'src/services/youtubeService.ts'
  'src/constants/storageKeys.ts'
  'src/i18n/popupText.ts'
  'src/types/playerMode.ts'
  'src/types/popupLocaleText.ts'
)
GENERATED=( 'build/chrome-mv3-dev' 'build/chrome-mv3-prod' '.plasmo' )
EXISTING_OLD=()
printf '\n대상 프로젝트: %s\n' "$ROOT"
printf '\n[삭제할 구형 v2 소스 파일]\n'
for f in "${OLD_SOURCES[@]}"; do
  if [[ -f "$ROOT/$f" || -L "$ROOT/$f" ]]; then
    EXISTING_OLD+=("$f")
    printf '  삭제 대상: %s\n' "$f"
  else
    printf '  없음(정상): %s\n' "$f"
  fi
done
printf '\n[지울 수 있는 자동 생성 빌드/캐시]\n'
for f in "${GENERATED[@]}"; do
  if [[ -e "$ROOT/$f" || -L "$ROOT/$f" ]]; then
    printf '  재생성 대상: %s\n' "$f"
  fi
done
printf '\n[유지되는 중요 파일]\n'
printf '  src/background.ts, src/tabs/*, src/services/documentPip.ts, package.json, .git, node_modules\n'

if [[ "$APPLY" != true ]]; then
  printf '\n미리보기만 완료했습니다. 실제로 삭제한 파일은 없습니다.\n'
  printf '확인 후 실제 적용: bash cleanup-miniview-v3.sh --apply\n'
  exit 0
fi

if (( ${#EXISTING_OLD[@]} > 0 )); then
  dir_name="$(basename "$ROOT")"
  backup="$ROOT/../${dir_name}-v2-backup-$(date +%Y%m%d-%H%M%S)-$$.tar.gz"
  (cd "$ROOT" && tar -czf "$backup" -- "${EXISTING_OLD[@]}")
  printf '\n구형 소스 백업 완료: %s\n' "$backup"
fi
for f in "${EXISTING_OLD[@]}"; do rm -f -- "$ROOT/$f"; done
for f in "${GENERATED[@]}"; do
  if [[ -e "$ROOT/$f" || -L "$ROOT/$f" ]]; then rm -rf -- "$ROOT/$f"; fi
done
printf '\n완료: 구형 v2 파일과 생성된 빌드 캐시를 정리했습니다.\n'
printf '다음: npm install && npm run dev\n'
printf '그 후 chrome://extensions 에서 빌드를 다시 로드하세요.\n'
