'use client'

import dynamic from 'next/dynamic'
import ChangeVideoModal from '@/components/chat-area/change-video-modal'
import DesktopScrollReveal from '@/components/desktop-scroll-reveal'
import { Tables } from '@/types/supabase'
import { ModifiedMessageType } from '@/types'
import { useState, useOptimistic, startTransition } from 'react'
import { broadcastMessage, updateRoom } from '@/utils/server-actions'
import { RoomMessagesProvider } from '@/components/room-messages-provider'

const VideoPlayer = dynamic(() => import('@/components/video-player'))
const ChatArea = dynamic(() => import('@/components/chat-area'))

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
    (state, newState) => ({ ...state, ...newState }) as Tables<'room'>
  )
  const [localFile, setLocalFile] = useState<{
    url: string
    type: string
  } | null>(null)

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

  return (
    <div className='relative h-full w-full'>
      <RoomMessagesProvider roomId={roomId}>
        <DesktopScrollReveal
          defaultVideoUrl={optimisticRoomData.video_url}
          onUrlSubmit={handleUrlSubmit}
          onFileReady={handleFileReady}
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
            headerActions={
              <ChangeVideoModal
                defaultVideoUrl={optimisticRoomData.video_url}
                onUrlSubmit={handleUrlSubmit}
                onFileReady={handleFileReady}
              />
            }
          />
        </DesktopScrollReveal>
      </RoomMessagesProvider>
    </div>
  )
}
