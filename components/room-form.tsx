'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import VideoPlayer from '@/components/video-player'
import ChatArea from '@/components/chat-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Users } from 'lucide-react'
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
import { useWebTorrentSeed, formatSpeed } from '@/utils/webtorrent'

export default function RoomForm({
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
  const [inputMode, setInputMode] = useState<'url' | 'file'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localFile, setLocalFile] = useState<{
    url: string
    type: string
  } | null>(null)
  const { seedFile, torrentState } = useWebTorrentSeed()
  const isSeeding = torrentState.ready && torrentState.magnetUri
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

  const handleUpdateRoomVideo = async (formData: FormData) => {
    const videoUrl = formData.get('video_url') as string
    startTransition(() => {
      addOptimisticRoomData({ video_url: videoUrl })
    })
    await updateRoom(roomId, { video_url: videoUrl })
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    if (localFile) {
      URL.revokeObjectURL(localFile.url)
    }
    const blobUrl = URL.createObjectURL(file)
    setLocalFile({ url: blobUrl, type: file.type || 'video/mp4' })

    try {
      const magnetUri = await seedFile(file)

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
    } catch (error) {
      console.error('Error creating torrent:', error)
    }
  }

  useEffect(() => {
    if (!isSeeding || !selectedFile) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSeeding, selectedFile])

  useEffect(() => {
    return () => {
      if (localFile) {
        URL.revokeObjectURL(localFile.url)
      }
    }
  }, [localFile])

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
        className='fixed right-1/2 translate-x-1/2 md:translate-x-0 md:right-4 top-[80%] md:top-1/2 z-[1] flex flex-col justify-end items-center gap-2 pointer-events-none'
      >
        <div className='flex flex-col items-center gap-1 relative text-foreground border border-1 h-12 w-6 rounded-xl before:content-[""] before:w-2 before:h-2 before:bg-gray-100 before:rounded-full before:top-3/4 before:-translate-y-1/2 before:absolute before:animate-fade-up'></div>
        <div className='text-xs flex flex-col items-center text-white'>
          <span>Scroll</span>
          <span>up</span>
        </div>
      </motion.div>
      <div
        ref={formSectionRef}
        className='h-screen flex flex-col mt-[100vh] relative z-[2] items-center justify-center p-4'
      >
        <div className='max-w-md m-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-5xl font-bold leading-[1.1] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60'>
              Change Video
            </h1>
            <p className='text-xl text-muted max-w-2xl mx-auto'>
              Update the video or upload a file to watch together.
            </p>
          </div>

          <div className='w-full max-w-md bg-card p-6 rounded-lg shadow-lg border'>
            <form
              className='flex flex-col gap-4'
              action={handleUpdateRoomVideo}
            >
              <div className='flex flex-col gap-3'>
                <div className='flex gap-1 border rounded-md p-1 w-fit'>
                  <Button
                    type='button'
                    variant={inputMode === 'url' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setInputMode('url')}
                  >
                    URL
                  </Button>
                  <Button
                    type='button'
                    variant={inputMode === 'file' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setInputMode('file')}
                  >
                    File
                  </Button>
                </div>

                {inputMode === 'url' ? (
                  <div className='flex flex-col gap-2 flex-1'>
                    <Label
                      htmlFor='video_url'
                      className='flex items-center gap-2'
                    >
                      Video URL
                      <span className='ml-1 text-xs text-muted-foreground'>
                        (supports Youtube and Vimeo only)
                      </span>
                    </Label>
                    <div className='relative'>
                      <Input
                        type='url'
                        placeholder='https://www.youtube.com/watch?v=19aPQJ2HYc8'
                        name='video_url'
                        id='video_url'
                        required={true}
                        defaultValue={optimisticRoomData.video_url}
                        className='transition-all focus:ring-2 focus:ring-primary/20'
                      />
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col gap-2 flex-1'>
                    <Label
                      htmlFor='file_input'
                      className='flex items-center gap-2'
                    >
                      Upload File
                    </Label>
                    <div>
                      <div className='relative'>
                        <Input
                          type='file'
                          id='file_input'
                          accept='video/*,audio/*'
                          onChange={handleFileSelect}
                          className='transition-all focus:ring-2 focus:ring-primary/20'
                        />
                        {selectedFile && !torrentState.ready && (
                          <div className='absolute right-1 top-1/2 -translate-y-1/2 bg-white w-6 h-8 flex items-center justify-center'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                          </div>
                        )}
                      </div>

                      {selectedFile && (
                        <div className='mt-2 space-y-1'>
                          <p className='text-xs text-muted-foreground'>
                            {selectedFile.name} (
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          {isSeeding && (
                            <div className='flex items-center gap-3 text-xs'>
                              <span className='flex items-center gap-1 text-green-500'>
                                <Upload className='h-3 w-3' />
                                Seeding
                              </span>
                              <span className='flex items-center gap-1 text-muted-foreground'>
                                <Users className='h-3 w-3' />
                                {torrentState.numPeers} peers
                              </span>
                              <span className='text-muted-foreground'>
                                ↑ {formatSpeed(torrentState.uploadSpeed)}
                              </span>
                            </div>
                          )}
                          {torrentState.error && (
                            <p className='text-xs text-red-500'>
                              {torrentState.error}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {inputMode === 'url' && (
                <Button type='submit' className='w-full'>
                  Update Video
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
