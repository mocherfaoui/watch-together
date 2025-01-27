'use client'
import { Tables } from '@/types/supabase'
import {
  broadcastMessage,
  checkLiveStreamConnectionStatus,
  revalidatePathOnServer,
  updateRoom
} from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/client'
import {
  useEffect,
  useOptimistic,
  startTransition,
  useState,
  useRef
} from 'react'
import { Input } from '../ui/input'
import dynamic from 'next/dynamic'
import { Button } from '../ui/button'
import { Loader2, ScreenShare, ScreenShareOff } from 'lucide-react'
import { WHIPClient } from '@eyevinn/whip-web-client'
import { cn } from '@/lib/utils'
import { StreamState } from '@/types'
import { WebRTCPlayer } from '@eyevinn/webrtc-player'
import { trackEvent } from '@/utils'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

export default function VideoPlayer({
  roomData,
  roomProfile
}: {
  roomData: Tables<'room'>
  roomProfile: Tables<'user'>
}) {
  const [optimisticRoomData, addOptimisticRoomData] = useOptimistic<
    Tables<'room'>,
    object
  >(
    roomData,
    (state, newState) => ({ ...state, ...newState } as Tables<'room'>)
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [streamState, setStreamState] = useState<StreamState>(
    roomData.is_streaming ? 'streaming' : 'not started'
  )
  const videoStreamRef = useRef<HTMLVideoElement>(null)

  const {
    video_url,
    id: roomId,
    current_streamer_id: currentStreamerId,
    stream_output: streamOutput
  } = optimisticRoomData
  const isCurrentUserStreaming = roomProfile.id === currentStreamerId

  const handleUpdateRoomVideo = async (formData: FormData) => {
    const videoUrl = formData.get('video_url') as string
    addOptimisticRoomData({ video_url: videoUrl })
    await updateRoom(roomId, { video_url: videoUrl })
    trackEvent('Room Video Updated')
  }

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:updates`)
      .on('broadcast', { event: 'playback-state' }, async ({ payload }) => {
        setIsPlaying(payload.isPlaying)
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
          if (payload?.is_streaming) {
            setStreamState('streaming')
          } else setStreamState('not started')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (
      ['not started', 'loading'].includes(streamState) ||
      !videoStreamRef.current ||
      isCurrentUserStreaming
    )
      return

    let player: WebRTCPlayer
    const loadGuestStream = async () => {
      player = new WebRTCPlayer({
        video: videoStreamRef.current!,
        type: 'whep'
      })
      await player.load(new URL(streamOutput ?? ''))
      player.unmute()
      trackEvent('Stream loaded for guest')
    }
    loadGuestStream()
    return () => player.destroy()
  }, [isCurrentUserStreaming, streamState, streamOutput])

  // when screen sharing is active, Chromium browsers display a native Stop sharing
  // button that stops the media stream and fires an inactive event. there is no way
  // to customise the behaviour of that button. I need to do some cleanup after stream
  // ends so this is an escape hatch for now.
  useEffect(() => {
    if (!videoStreamRef.current?.srcObject) return

    const handleStreamEnd = async () => {
      setStreamState('not started')
      const newRoomState = {
        is_streaming: false,
        current_streamer_id: null
      }
      startTransition(() => addOptimisticRoomData(newRoomState))
      await updateRoom(roomId, newRoomState)
      trackEvent('Stream stopped using browser native button')
    }

    const stream = videoStreamRef.current?.srcObject as MediaStream
    stream.addEventListener('inactive', handleStreamEnd)

    return () => {
      stream.removeEventListener('inactive', handleStreamEnd)
    }
  }, [videoStreamRef.current?.srcObject, addOptimisticRoomData, roomId])

  const startStream = async () => {
    setStreamState('loading')
    try {
      const client = new WHIPClient({
        endpoint: roomData.stream_input ?? '',
        opts: { noTrickleIce: false }
      })

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        // @ts-expect-error // no typescript support for the options below as they are still experimental
        surfaceSwitching: 'exclude',
        selfBrowserSurface: 'exclude'
      })

      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = mediaStream
      }

      await client.ingest(mediaStream)

      // users can get an error if the stream is not connected right away
      // waiting until the stream status is 'connected' to broadcast the room state
      // TODO: work on a better solution
      let isConnected = false
      while (!isConnected) {
        isConnected = await checkLiveStreamConnectionStatus(roomData.stream_id)
        if (!isConnected) {
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for 2 seconds before checking again
        }
      }

      const newRoomState = {
        is_streaming: true,
        current_streamer_id: roomProfile.id
      }
      startTransition(() => addOptimisticRoomData(newRoomState))
      await updateRoom(roomId, newRoomState)

      setStreamState('streaming')
      trackEvent('Stream started')
    } catch (error) {
      console.error('Error starting stream:', error)
      setStreamState('not started')
    }
  }

  const stopScreenSharing = async () => {
    const tracks = (
      videoStreamRef.current?.srcObject as MediaStream
    )?.getTracks()

    if (tracks?.length) {
      tracks.forEach((track: MediaStreamTrack) => track.stop())
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = null
      }
    }
    setStreamState('not started')
    const newRoomState = {
      is_streaming: false,
      current_streamer_id: null
    }
    startTransition(() => addOptimisticRoomData(newRoomState))
    await updateRoom(roomId, newRoomState)
    trackEvent('Stream stopped using custom button')
  }

  return (
    <div className='flex flex-col flex-1'>
      <div className='flex gap-2 border-b border-gray-200 p-3'>
        <form className='w-full' action={handleUpdateRoomVideo}>
          <Input
            type='text'
            defaultValue={video_url as string}
            name='video_url'
            placeholder='Enter video URL...'
            className='w-full px-3 py-2 text-base border border-gray-300 rounded-md'
            required={true}
          />
        </form>
        {['not started', 'loading'].includes(streamState) && (
          <Button
            onClick={startStream}
            className='hidden lg:flex'
            disabled={streamState === 'loading'}
          >
            {streamState === 'loading' && <Loader2 className='animate-spin' />}
            <ScreenShare />
            <span>Share Screen</span>
          </Button>
        )}
        {isCurrentUserStreaming && (
          <Button variant='destructive' onClick={stopScreenSharing}>
            <ScreenShareOff />
            <span>Stop Sharing Screen</span>
          </Button>
        )}
      </div>
      <div className='flex-1 min-h-[300px] relative'>
        <div
          className={cn({
            hidden: true,
            'flex flex-col absolute top-0 left-0 w-full h-full':
              streamState === 'streaming'
          })}
        >
          <video
            ref={videoStreamRef}
            autoPlay
            controls
            muted
            className='min-w-full min-h-full w-auto h-auto'
          />
        </div>
        {streamState === 'loading' && (
          <div className='flex justify-center items-center h-full'>
            <p className='text-lg'>Setting up the stream...</p>
          </div>
        )}
        <div
          className={cn({
            'relative h-full': true,
            hidden: ['streaming', 'loading'].includes(streamState)
          })}
        >
          <ReactPlayer
            playing={isPlaying}
            url={video_url as string}
            controls={true}
            width='100%'
            height='100%'
            style={{ position: 'absolute', top: 0, left: 0 }}
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
          />
        </div>
      </div>
    </div>
  )
}
