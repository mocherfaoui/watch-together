'use client'
import { Tables } from '@/types/supabase'
import {
  broadcastMessage,
  revalidatePathOnServer,
  updateRoomVideo
} from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useOptimistic, startTransition, useState } from 'react'
import { Input } from '../ui/input'
import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

export default function VideoPlayer({
  roomData
}: {
  roomData: Tables<'room'>
}) {
  const [optimisticRoomData, addOptimisticRoomData] = useOptimistic<
    Tables<'room'>,
    object
  >(
    roomData,
    (state, newState) => ({ ...state, ...newState } as Tables<'room'>)
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const { video_url, id: roomId } = optimisticRoomData

  const handleUpdateRoomVideo = async (formData: FormData) => {
    const videoUrl = formData.get('video_url') as string
    addOptimisticRoomData({ video_url: videoUrl })
    await updateRoomVideo(videoUrl, roomId)
  }

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:updates`)
      .on('broadcast', { event: 'playback-state' }, async ({ payload }) => {
        console.log({ payload })
        setIsPlaying(payload.isPlaying)
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room',
          filter: `id=eq.${roomId}`
        },
        async (payload) => {
          startTransition(() => {
            addOptimisticRoomData({ video_url: payload.new.video_url })
          })
          await revalidatePathOnServer(`/room/${roomId}/@videoplayer`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className='flex flex-col flex-1'>
      <form
        className='w-full border-b border-gray-200 p-3'
        action={handleUpdateRoomVideo}
      >
        <Input
          type='text'
          defaultValue={video_url as string}
          name='video_url'
          placeholder='Enter video URL...'
          className='w-[calc(100%_-_40px)] md:w-full px-3 py-2 text-base border border-gray-300 rounded-md'
          required={true}
        />
      </form>
      <div className='flex-1 min-h-[300px]'>
        <div className='relative h-full'>
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
