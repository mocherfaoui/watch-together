'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { RefreshCw } from 'lucide-react'

export default function ErrorState() {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4 p-4'>
      <div className='text-center space-y-2'>
        <h1 className='text-2xl font-bold'>Something went wrong</h1>
        <p className='text-muted-foreground'>
          We couldn&apos;t create your room. Please try again.
        </p>
      </div>
      <Button asChild>
        <Link href='/'>
          <RefreshCw className='h-4 w-4 mr-2' />
          Try Again
        </Link>
      </Button>
    </div>
  )
}
