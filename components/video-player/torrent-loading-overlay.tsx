import { Download, RefreshCw, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { formatSpeed } from '@/utils/webtorrent'
import { scrollToReplaceVideo } from '@/utils/video-player'

type TorrentLoadingOverlayProps = {
  numPeers: number
  downloadSpeed: number
  progress: number
  error: string | null
  showReplaceOption: boolean
}

export default function TorrentLoadingOverlay({
  numPeers,
  downloadSpeed,
  progress,
  error,
  showReplaceOption
}: TorrentLoadingOverlayProps) {
  return (
    <div className='absolute inset-0 flex flex-col justify-center items-center bg-black/80 backdrop-blur-xl z-11'>
      <Download className='h-8 w-8 mb-3 animate-pulse text-white' />
      <p className='text-lg text-white mb-2'>Loading torrent...</p>
      <div className='flex items-center gap-4 text-sm text-gray-400'>
        <span className='flex items-center gap-1'>
          <Users className='h-4 w-4' />
          {numPeers} peers
        </span>
        <span>↓ {formatSpeed(downloadSpeed)}</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      {error && (
        <p className='text-red-500 mt-2 text-sm'>
          An error occurred while loading the torrent. Please try again.
        </p>
      )}
      {showReplaceOption && (
        <Button
          onClick={scrollToReplaceVideo}
          variant='outline'
          className='mt-4'
        >
          <RefreshCw className='h-4 w-4' />
          Replace
        </Button>
      )}
    </div>
  )
}
