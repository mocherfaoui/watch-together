'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import VideoPlayer from '@/components/video-player'
import ChatArea from '@/components/chat-area'
import UpdateRoomForm from '@/components/update-room-form'
import { Tables } from '@/types/supabase'
import { ModifiedMessageType } from '@/types'
import {
  useState,
  useOptimistic,
  startTransition,
  useEffect,
  useRef
} from 'react'
import { broadcastMessage, updateRoom } from '@/utils/server-actions'

export default function Room({
  roomData,
  roomProfile,
  messages,
  roomId
}: {
  roomData: Tables<'room'>
  roomProfile: Tables<'user'>
  messages: ModifiedMessageType
  roomId: string
}) {
  const [optimisticRoomData, addOptimisticRoomData] = useOptimistic<
    Tables<'room'>,
    Partial<Tables<'room'>>
  >(
    roomData,
    (state, newState) => ({ ...state, ...newState } as Tables<'room'>)
  )
  const [localFile, setLocalFile] = useState<{
    url: string
    type: string
  } | null>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const blurBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'blur(0px) brightness(1)',
      'blur(4px) brightness(0.8)',
      'blur(10px) brightness(0.4)'
    ]
  )

  const hideScrollIndicator = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 0.5, 1]
  )

  const handleUrlSubmit = async (videoUrl: string) => {
    startTransition(() => {
      addOptimisticRoomData({ video_url: videoUrl })
    })
    await updateRoom(roomId, { video_url: videoUrl })
  }

  const handleFileReady = async ({
    magnetUri,
    localFile: newLocalFile
  }: {
    magnetUri: string
    localFile: { url: string; type: string }
  }) => {
    setLocalFile(newLocalFile)

    const newRoomState = {
      video_url: magnetUri,
      torrent_uploader_id: roomProfile.id
    }

    startTransition(() => {
      addOptimisticRoomData(newRoomState)
    })

    await updateRoom(roomId, newRoomState)

    await broadcastMessage({
      room: `room:${roomId}:updates`,
      event: 'room-updates',
      payload: newRoomState
    })
  }

  useEffect(() => {
    const scrollToForm = () => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (document.readyState === 'complete') {
      scrollToForm()
    } else {
      window.addEventListener('load', scrollToForm)
      return () => window.removeEventListener('load', scrollToForm)
    }
  }, [])

  return (
    <div className='relative h-full w-full'>
      <motion.div
        className='h-full fixed top-0 flex flex-col md:flex-row w-full'
        style={{ filter: blurBackground }}
      >
        <div className='flex flex-1 bg-white'>
          <VideoPlayer
            roomData={optimisticRoomData}
            roomProfile={roomProfile}
            localFile={localFile}
          />
        </div>
        <ChatArea
          roomProfile={roomProfile}
          messages={messages}
          roomId={roomId}
        />
      </motion.div>
      <motion.div
        style={{ opacity: hideScrollIndicator }}
        className='fixed right-1/2 translate-x-1/2 md:translate-x-0 md:right-4 top-[80%] md:top-1/2 z-1 flex flex-col justify-end items-center gap-2 pointer-events-none'
      >
        <div className='flex flex-col items-center gap-1 relative text-foreground border h-12 w-6 rounded-xl before:content-[""] before:w-2 before:h-2 before:bg-gray-100 before:rounded-full before:top-3/4 before:-translate-y-1/2 before:absolute before:animate-fade-up'></div>
        <div className='text-xs flex md:flex-col gap-1 md:gap-0 items-center text-white'>
          <span>Scroll</span>
          <span>up</span>
        </div>
      </motion.div>
      <div
        ref={formSectionRef}
        className='h-screen flex flex-col mt-[100vh] relative z-2 items-center justify-center p-4'
      >
        <div className='max-w-md m-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-5xl font-bold leading-[1.1] mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-white/60'>
              Change Video
            </h1>
            <p className='text-xl text-muted max-w-2xl mx-auto'>
              Update the video or upload a file to watch together.
            </p>
          </div>

          <UpdateRoomForm
            defaultVideoUrl={optimisticRoomData.video_url}
            onUrlSubmit={handleUrlSubmit}
            onFileReady={handleFileReady}
          />
        </div>
      </div>
    </div>
  )
}
