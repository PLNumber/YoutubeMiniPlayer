/** YouTube 탭의 content script에서만 호출합니다. */
export function findYouTubeVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video"))
    .filter((video) => video.getClientRects().length > 0)

  // 쇼츠 페이지에도 여러 영상이 있을 수 있으므로, 실제 재생 중인 영상을 우선합니다.
  videos.sort((a, b) => scoreVideo(b) - scoreVideo(a))
  return videos[0] ?? null
}

function scoreVideo(video: HTMLVideoElement): number {
  let score = 0
  if (!video.paused && !video.ended) score += 100
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) score += 20
  if (video.classList.contains("html5-main-video")) score += 10
  return score
}

export async function togglePictureInPicture(): Promise<"opened" | "closed"> {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture()
    return "closed"
  }

  if (!document.pictureInPictureEnabled) {
    throw new Error("이 브라우저 또는 페이지에서는 PiP를 사용할 수 없습니다.")
  }

  const video = findYouTubeVideo()
  if (!video) {
    throw new Error("재생할 유튜브 영상을 찾지 못했습니다.")
  }
  if (video.disablePictureInPicture) {
    throw new Error("현재 영상에서는 PiP 사용이 제한되어 있습니다.")
  }
  if (video.readyState < HTMLMediaElement.HAVE_METADATA || video.videoWidth === 0) {
    throw new Error("영상이 준비된 뒤 다시 시도해 주세요.")
  }

  // 중요: 이 호출 앞에 await을 넣지 않습니다. 실제 클릭의 사용자 활성화가 필요합니다.
  await video.requestPictureInPicture()
  return "opened"
}
