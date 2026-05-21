import { useSyncExternalStore } from 'react'

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange)
  document.addEventListener('webkitfullscreenchange', onChange)
  return () => {
    document.removeEventListener('fullscreenchange', onChange)
    document.removeEventListener('webkitfullscreenchange', onChange)
  }
}

function getFullscreenSnapshot() {
  return !!(
    document.fullscreenElement ||
    (document as Document & { webkitFullscreenElement?: Element })
      .webkitFullscreenElement
  )
}

function getFullscreenServerSnapshot() {
  return false
}

/**
 * useIsFullscreen
 *
 * Tracks whether any element on the document is currently in fullscreen mode
 * (via the Fullscreen API).
 */
export function useIsFullscreen(): boolean {
  return useSyncExternalStore(
    subscribeFullscreen,
    getFullscreenSnapshot,
    getFullscreenServerSnapshot
  )
}
