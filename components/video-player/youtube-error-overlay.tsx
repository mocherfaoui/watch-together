'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import {
  describeYouTubeIframeError,
  isYouTubePlayerUrl,
  parseYouTubeIframeErrorCode
} from '@/utils/youtube-iframe-messages'

type YoutubeErrorOverlayProps = {
  videoUrl: string | null | undefined
}

export default function YoutubeErrorOverlay({
  videoUrl
}: YoutubeErrorOverlayProps) {
  const [code, setCode] = useState<number | null>(null)
  const isYoutube = isYouTubePlayerUrl(videoUrl)

  useEffect(() => {
    setCode(null)
  }, [videoUrl])

  useEffect(() => {
    if (!isYoutube || !videoUrl) return

    const onMessage = (event: MessageEvent) => {
      const next = parseYouTubeIframeErrorCode(event)
      if (next != null) {
        console.warn('[youtube] onError', next)
        setCode(next)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isYoutube, videoUrl])

  if (code === null) return null

  const { title, description, showWatchOnYouTube } =
    describeYouTubeIframeError(code)

  return (
    <div className='absolute inset-0 flex flex-col justify-center items-center bg-black/80 backdrop-blur-xl z-11 px-4'>
      <AlertCircle className='h-8 w-8 mb-3 text-red-400' />
      <p className='text-lg text-white mb-2 text-center'>{title}</p>
      <p className='text-sm text-gray-400 mb-2 text-center max-w-md'>
        {description}
      </p>
      <p className='text-xs text-gray-500 mb-4'>YouTube error code {code}</p>
      <div className='flex gap-2 flex-wrap justify-center'>
        {showWatchOnYouTube && videoUrl && (
          <Button asChild variant='outline'>
            <a href={videoUrl} target='_blank' rel='noopener noreferrer'>
              <ExternalLink className='h-4 w-4' />
              Watch on YouTube
            </a>
          </Button>
        )}
        <Button
          onClick={() =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth'
            })
          }
          variant='outline'
          className='hidden md:flex'
        >
          <RefreshCw className='h-4 w-4' />
          Replace
        </Button>
      </div>
    </div>
  )
}
