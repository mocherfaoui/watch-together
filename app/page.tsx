'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCreateRoom } from '@/utils/server-actions'
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [, createRoomAction, isCreatingRoom] = useActionState(
    handleCreateRoom,
    null
  )

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4'>
      <h1 className='text-4xl font-bold mb-8'>Watch Together</h1>
      <form
        className='flex flex-col w-full max-w-md gap-4'
        action={createRoomAction}
      >
        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='video_url'>Video URL</Label>
            <Input
              type='url'
              placeholder=''
              name='video_url'
              id='video_url'
              required={true}
            />
          </div>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='username'>Username</Label>
            <Input
              type='text'
              placeholder=''
              name='username'
              id='username'
              required={true}
            />
          </div>
        </div>

        <Button disabled={isCreatingRoom}>
          {isCreatingRoom && <Loader2 className='animate-spin' />}Create Room
        </Button>
      </form>
    </main>
  )
}
