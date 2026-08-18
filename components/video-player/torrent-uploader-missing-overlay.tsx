import { FileX, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { scrollToReplaceVideo } from '@/utils/video-player'

export default function TorrentUploaderMissingOverlay() {
  return (
    <div className='absolute inset-0 flex flex-col justify-center items-center bg-black/80 z-10'>
      <FileX className='h-8 w-8 mb-3 text-white' />
      <p className='text-lg text-white mb-2'>File not available</p>
      <p className='text-sm text-gray-400 mb-4 text-center px-4'>
        The original file is no longer being shared. Upload a new one to
        continue.
      </p>
      <Button onClick={scrollToReplaceVideo} variant='outline'>
        <RefreshCw className='h-4 w-4' />
        Replace
      </Button>
    </div>
  )
}
