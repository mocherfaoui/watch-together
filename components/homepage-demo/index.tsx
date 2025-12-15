'use client'

import { useEffect } from 'react'
import VideoPlayer from '@/components/video-player'
import ChatArea from '@/components/chat-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCreateRoom } from '@/utils/server-actions'
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { Tables } from '@/types/supabase'
import { ModifiedMessageType } from '@/types'

export default function HomepageDemo({
  roomData,
  roomProfile,
  messages
}: {
  roomData: Tables<'room'>
  roomProfile: Tables<'user'>
  messages: ModifiedMessageType
}) {
  const [state, createRoomAction, isCreatingRoom] = useActionState<
    {
      error: string
      formData: { username: string; video_url: string }
    } | null,
    FormData
  >(handleCreateRoom, null)

  useEffect(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory'
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollSnapType = ''
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div className='relative'>
      <div className='h-dvh flex flex-col md:flex-row w-full snap-start relative'>
        <div className='flex flex-1'>
          <VideoPlayer roomData={roomData} roomProfile={roomProfile} />
        </div>
        <ChatArea
          roomProfile={roomProfile}
          messages={messages}
          roomId={roomData.id}
        />
      </div>

      <div className='h-dvh flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted snap-start'>
        <div className='max-w-md m-auto scroll-animate-form'>
          <div className='text-center mb-12'>
            <h1 className='text-5xl font-bold leading-[1.1] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60'>
              Watch Together
            </h1>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              Watch videos and chat with friends in real-time.
            </p>
          </div>

          <div className='w-full max-w-md bg-card p-6 rounded-lg shadow-lg border'>
            <form className='flex flex-col gap-4' action={createRoomAction}>
              <div className='flex flex-col gap-3'>
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
                  <Input
                    type='url'
                    placeholder='https://www.youtube.com/watch?v=19aPQJ2HYc8'
                    name='video_url'
                    id='video_url'
                    required={true}
                    defaultValue={state?.formData?.video_url}
                    className='transition-all focus:ring-2 focus:ring-primary/20'
                  />
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label htmlFor='username' className='flex items-center gap-2'>
                    Username
                  </Label>
                  <Input
                    type='text'
                    placeholder='alliex'
                    name='username'
                    id='username'
                    required={true}
                    defaultValue={state?.formData?.username}
                    className='transition-all focus:ring-2 focus:ring-primary/20'
                  />
                </div>
              </div>

              {state?.error && (
                <p className='text-red-500 text-sm'>{state.error}</p>
              )}

              <Button
                disabled={isCreatingRoom}
                data-umami-event='Create Room button'
                className='w-full'
              >
                {isCreatingRoom ? (
                  <Loader2 className='animate-spin mr-2' />
                ) : null}
                Create Room
              </Button>
            </form>
          </div>

          <p className='mt-6 text-sm text-muted-foreground text-center max-w-md'>
            The room will be automatically deleted after 6 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
