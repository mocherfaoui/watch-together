'use client'
import { Tables } from '@/types/supabase'
import {
  broadcastMessage,
  revalidatePathOnServer
} from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/client'
import {
  useEffect,
  useOptimistic,
  startTransition,
  useState,
  useRef
} from 'react'
import { Download, Users, RefreshCw, FileX } from 'lucide-react'

import { trackEvent } from '@/utils'
import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster
} from '@vidstack/react'
import { VideoLayout } from './video-layout'
import '@vidstack/react/player/styles/base.css'
import { useWebTorrentDownload, formatSpeed } from '@/utils/webtorrent'
import { Button } from '../ui/button'

export default function VideoPlayer({
  roomData,
  roomProfile,
  localFile
}: {
  roomData: Tables<'room'>
  roomProfile: Tables<'user'>
  localFile?: { url: string; type: string } | null
}) {
  const [optimisticRoomData, addOptimisticRoomData] = useOptimistic<
    Tables<'room'>,
    object
  >(
    roomData,
    (state, newState) => ({ ...state, ...newState } as Tables<'room'>)
  )
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const videoPlayerRef = useRef<MediaPlayerInstance>(null)

  const { downloadTorrent, torrentState } = useWebTorrentDownload()
  const [showReplaceOption, setShowReplaceOption] = useState(false)

  const { video_url, id: roomId, torrent_uploader_id } = optimisticRoomData

  const isMagnetUri = video_url?.startsWith('magnet:')
  const isUploader = torrent_uploader_id === roomProfile.id

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:updates`)
      .on('broadcast', { event: 'playback-state' }, async ({ payload }) => {
        if (payload.isPlaying) {
          await videoPlayerRef.current?.play()
        } else {
          await videoPlayerRef.current?.pause()
        }
      })
      .on(
        'broadcast',
        {
          event: 'room-updates'
        },
        async ({ payload }) => {
          if (payload.current_streamer_id === roomProfile.id) return

          startTransition(() => {
            addOptimisticRoomData(payload)
          })
          await revalidatePathOnServer(`/room/${roomId}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (!isMagnetUri || !video_url || isUploader) {
      return
    }

    let cancelled = false
    setShowReplaceOption(false)

    const loadTorrent = async () => {
      try {
        const url = await downloadTorrent(video_url)
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

    loadTorrent()

    return () => {
      cancelled = true
    }
  }, [video_url, isMagnetUri, isUploader, downloadTorrent])

  return (
    <div className='flex flex-col flex-1'>
      <div className='flex-1 min-h-[300px] relative'>
        {isMagnetUri && !isUploader && !torrentState.ready && (
          <div className='absolute inset-0 flex flex-col justify-center items-center bg-black/80 z-10'>
            <Download className='h-8 w-8 mb-3 animate-pulse text-white' />
            <p className='text-lg text-white mb-2'>Loading torrent...</p>
            <div className='flex items-center gap-4 text-sm text-gray-400'>
              <span className='flex items-center gap-1'>
                <Users className='h-4 w-4' />
                {torrentState.numPeers} peers
              </span>
              <span>↓ {formatSpeed(torrentState.downloadSpeed)}</span>
              <span>{Math.round(torrentState.progress * 100)}%</span>
            </div>
            {torrentState.error && (
              <p className='text-red-500 mt-2 text-sm'>{torrentState.error}</p>
            )}
            {showReplaceOption && (
              <Button
                onClick={() =>
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                  })
                }
                variant='outline'
                className='mt-4'
              >
                <RefreshCw className='h-4 w-4' />
                Replace
              </Button>
            )}
          </div>
        )}
        {isMagnetUri && isUploader && !localFile && (
          <div className='absolute inset-0 flex flex-col justify-center items-center bg-black/80 z-10'>
            <FileX className='h-8 w-8 mb-3 text-white' />
            <p className='text-lg text-white mb-2'>File not available</p>
            <p className='text-sm text-gray-400 mb-4 text-center px-4'>
              The original file is no longer being shared. Upload a new one to
              continue.
            </p>
            <Button
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: 'smooth'
                })
              }
              variant='outline'
            >
              <RefreshCw className='h-4 w-4' />
              Replace
            </Button>
          </div>
        )}

        <div className='relative h-full'>
          <MediaPlayer
            ref={videoPlayerRef}
            src={
              isMagnetUri
                ? isUploader && localFile
                  ? {
                      src: localFile.url,
                      type: localFile.type as 'video/mp4'
                    }
                  : streamUrl
                  ? { src: streamUrl, type: 'video/mp4' as const }
                  : ''
                : video_url
            }
            playsInline
            className='h-full w-full border-0 rounded-none'
            onPlay={async () => {
              await broadcastMessage({
                room: `room:${roomId}:updates`,
                event: 'playback-state',
                payload: { isPlaying: true }
              })
            }}
            onPause={async () => {
              await broadcastMessage({
                room: `room:${roomId}:updates`,
                event: 'playback-state',
                payload: { isPlaying: false }
              })
            }}
          >
            <MediaProvider className='h-full w-full !absolute [&_.vds-blocker]:h-full'>
              <Poster className='border-0 rounded-none absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-contain backdrop-blur-lg' />
            </MediaProvider>
            <VideoLayout />
          </MediaPlayer>
        </div>
      </div>
    </div>
  )
}
