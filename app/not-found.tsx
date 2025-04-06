import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className='h-full flex flex-col items-center justify-center p-4'>
      <div className='text-center space-y-4 max-w-md'>
        <h1 className='text-4xl font-bold'>Room Not Found</h1>
        <p className='text-gray-500'>
          This room has been deleted. It may have been automatically removed
          after 6 hours or manually deleted by the host.
        </p>
        <Button asChild>
          <Link href='/'>Create a New Room</Link>
        </Button>
      </div>
    </main>
  )
}
