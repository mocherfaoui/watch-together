'use client'

import { useRef } from 'react'
import { Tables } from '@/types/supabase'
import type { MediaPlayerInstance } from '@vidstack/react'
import { useRoomRealtimeUpdates } from '@/hooks/useRoomRealtimeUpdates'
import { useVideoPlaybackSync } from '@/hooks/useVideoPlaybackSync'
import { useVideoTorrentStream } from '@/hooks/useVideoTorrentStream'
import { getVideoPlayerSrc } from '@/utils/video-player'
import VideoPlayerView from './video-player-view'
import YoutubeErrorOverlay from './youtube-error-overlay'
import TorrentLoadingOverlay from './torrent-loading-overlay'
import TorrentUploaderMissingOverlay from './torrent-uploader-missing-overlay'

export default function VideoPlayer({
  roomData,
  roomProfile,
  localFile,
  addOptimisticMessages
}: {
  roomData: Tables<'room'>
  roomProfile: Tables<'user'>
  localFile?: { url: string; type: string } | null
  addOptimisticMessages: (action: object) => void
}) {
  const videoPlayerRef = useRef<MediaPlayerInstance>(null)
  const optimisticRoomData = useRoomRealtimeUpdates(roomData, roomProfile)

  const { video_url, id: roomId, torrent_uploader_id } = optimisticRoomData
  const isMagnetUri = video_url?.startsWith('magnet:') ?? false
  const isUploader = torrent_uploader_id === roomProfile.id

  const { handlePlay, handlePause } = useVideoPlaybackSync({
    roomData,
    roomProfile,
    roomId,
    addOptimisticMessages,
    videoPlayerRef
  })

  const { streamUrl, torrentState, showReplaceOption, showLoadingOverlay } =
    useVideoTorrentStream({
      videoUrl: video_url,
      isMagnetUri,
      isUploader
    })

  const videoSrc = getVideoPlayerSrc({
    isMagnetUri,
    isUploader,
    localFile,
    streamUrl,
    videoUrl: video_url
  })

  return (
    <div className='flex flex-col flex-1'>
      <div className='flex-1 min-h-[300px] relative'>
        {showLoadingOverlay && (
          <TorrentLoadingOverlay
            numPeers={torrentState.numPeers}
            downloadSpeed={torrentState.downloadSpeed}
            progress={torrentState.progress}
            error={torrentState.error}
            showReplaceOption={showReplaceOption}
          />
        )}
        {isMagnetUri && isUploader && !localFile && (
          <TorrentUploaderMissingOverlay />
        )}
        <YoutubeErrorOverlay videoUrl={video_url} />

        <div className='relative h-full'>
          <VideoPlayerView
            videoPlayerRef={videoPlayerRef}
            videoSrc={videoSrc}
            currentUserId={roomProfile.id}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        </div>
      </div>
    </div>
  )
}
