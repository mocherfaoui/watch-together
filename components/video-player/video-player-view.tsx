'use client'

import type { RefObject } from 'react'
import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster,
  useMediaStore
} from '@vidstack/react'
import '@vidstack/react/player/styles/base.css'
import { VideoLayout } from './video-layout'
import FloatingMessages from './floating-messages'
import { configureMediaProvider, getVideoPlayerSrc } from '@/utils/video-player'

type VideoPlayerViewProps = {
  videoPlayerRef: RefObject<MediaPlayerInstance | null>
  videoSrc: ReturnType<typeof getVideoPlayerSrc>
  currentUserId: string
  onPlay: () => void
  onPause: () => void
}

export default function VideoPlayerView({
  videoPlayerRef,
  videoSrc,
  currentUserId,
  onPlay,
  onPause
}: VideoPlayerViewProps) {
  const { fullscreen } = useMediaStore(videoPlayerRef)

  return (
    <MediaPlayer
      ref={videoPlayerRef}
      onProviderChange={configureMediaProvider}
      src={videoSrc}
      playsInline
      className='h-full w-full border-0 rounded-none'
      onPlay={onPlay}
      onPause={onPause}
    >
      <MediaProvider className='h-full w-full absolute! [&_.vds-blocker]:h-full'>
        <Poster className='border-0 rounded-none absolute inset-0 block h-full w-full opacity-0 transition-opacity data-visible:opacity-100 object-contain backdrop-blur-lg' />
      </MediaProvider>
      <VideoLayout />
      {fullscreen && <FloatingMessages currentUserId={currentUserId} />}
    </MediaPlayer>
  )
}
