'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCreateRoom } from '@/utils/server-actions'
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [state, createRoomAction, isCreatingRoom] = useActionState<
    {
      error: string
      formData: { username: string; video_url: string }
    } | null,
    FormData
  >(handleCreateRoom, null)

  return (
    <main className='h-full flex flex-col items-center justify-center p-4'>
      <h1 className='text-4xl font-bold mb-8'>Watch Together</h1>
      <form
        className='flex flex-col w-full max-w-md gap-4'
        action={createRoomAction}
      >
        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='video_url'>
              Video URL
              <span className='ml-1 text-xs text-gray-500'>
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
            />
          </div>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='username'>Username</Label>
            <Input
              type='text'
              placeholder='alliex'
              name='username'
              id='username'
              required={true}
              defaultValue={state?.formData?.username}
            />
          </div>
        </div>

        {state?.error && <p className='text-red-500 text-sm'>{state.error}</p>}

        <Button disabled={isCreatingRoom} data-umami-event='Create Room button'>
          {isCreatingRoom && <Loader2 className='animate-spin' />}Create Room
        </Button>
      </form>
      <p className='mt-4 text-sm text-gray-500 text-center max-w-md'>
        The room will be automatically deleted after 6 hours.
      </p>
    </main>
  )
}
