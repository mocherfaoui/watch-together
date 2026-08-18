'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/utils'
import { useWebTorrentDownload } from '@/utils/webtorrent'

type UseVideoTorrentStreamOptions = {
  videoUrl: string
  isMagnetUri: boolean
  isUploader: boolean
}

export function useVideoTorrentStream({
  videoUrl,
  isMagnetUri,
  isUploader
}: UseVideoTorrentStreamOptions) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [showReplaceOption, setShowReplaceOption] = useState(false)
  const { downloadTorrent, torrentState } = useWebTorrentDownload()

  useEffect(() => {
    if (!isMagnetUri || !videoUrl || isUploader) {
      return
    }

    let cancelled = false
    setShowReplaceOption(false)

    const loadTorrent = async () => {
      try {
        const url = await downloadTorrent(videoUrl)
        if (url && !cancelled) {
          trackEvent('Torrent loaded for viewer')
          setStreamUrl(url)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading torrent:', error)
          setShowReplaceOption(true)
        }
      }
    }

    void loadTorrent()

    return () => {
      cancelled = true
    }
  }, [videoUrl, isMagnetUri, isUploader, downloadTorrent])

  return {
    streamUrl,
    torrentState,
    showReplaceOption,
    showLoadingOverlay: isMagnetUri && !isUploader && !torrentState.ready
  }
}
