'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCreateRoom } from '@/utils/server-actions'
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const [state, createRoomAction, isCreatingRoom] = useActionState<
    {
      error: string
      formData: { username: string; video_url: string }
    } | null,
    FormData
  >(handleCreateRoom, null)

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted'>
      <div className='max-w-md m-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <h1 className='text-5xl font-bold leading-[1.1] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60'>
            Watch Together
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Watch videos and chat with friends in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='w-full max-w-md bg-card p-6 rounded-lg shadow-lg border'
        >
          <form className='flex flex-col gap-4' action={createRoomAction}>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-2 flex-1'>
                <Label htmlFor='video_url' className='flex items-center gap-2'>
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-red-500 text-sm'
              >
                {state.error}
              </motion.p>
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
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-6 text-sm text-muted-foreground text-center max-w-md'
        >
          The room will be automatically deleted after 6 hours.
        </motion.p>
      </div>
    </main>
  )
}
