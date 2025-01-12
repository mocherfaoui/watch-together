import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCreateRoom } from '@/utils/server-actions'

export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4'>
      <h1 className='text-4xl font-bold mb-8'>Watch Together</h1>

      <form
        className='flex flex-col w-full max-w-md gap-4'
        action={handleCreateRoom}
      >
        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='video_url'>Video URL</Label>
            <Input type='url' placeholder='' name='video_url' id='video_url' />
          </div>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='username'>Username</Label>
            <Input type='text' placeholder='' name='username' id='username' />
          </div>
        </div>

        <Button>Create Room</Button>
      </form>
    </main>
  )
}
