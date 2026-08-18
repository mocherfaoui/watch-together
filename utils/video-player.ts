import { isYouTubeProvider, type MediaProviderAdapter } from '@vidstack/react'

export function scrollToReplaceVideo() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}

export function configureMediaProvider(provider: MediaProviderAdapter | null) {
  if (isYouTubeProvider(provider)) {
    provider.cookies = true
  }
}

export function getVideoPlayerSrc({
  isMagnetUri,
  isUploader,
  localFile,
  streamUrl,
  videoUrl
}: {
  isMagnetUri: boolean
  isUploader: boolean
  localFile?: { url: string; type: string } | null
  streamUrl: string | null
  videoUrl: string
}) {
  if (!isMagnetUri) {
    return videoUrl
  }

  if (isUploader && localFile) {
    return {
      src: localFile.url,
      type: localFile.type as 'video/mp4'
    }
  }

  if (streamUrl) {
    return { src: streamUrl, type: 'video/mp4' as const }
  }

  return ''
}
