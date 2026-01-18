'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Users } from 'lucide-react'
import { useWebTorrentSeed, formatSpeed } from '@/utils/webtorrent'
import { cn } from '@/lib/utils'

type UpdateRoomFormProps = {
  defaultVideoUrl: string
  onUrlSubmit: (videoUrl: string) => void
  onFileReady: (data: {
    magnetUri: string
    localFile: { url: string; type: string }
  }) => void
}

export default function UpdateRoomForm({
  defaultVideoUrl,
  onUrlSubmit,
  onFileReady
}: UpdateRoomFormProps) {
  const [inputMode, setInputMode] = useState<'url' | 'file'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localFile, setLocalFile] = useState<{
    url: string
    type: string
  } | null>(null)
  const { seedFile, torrentState } = useWebTorrentSeed()
  const isSeeding = torrentState.ready && torrentState.magnetUri
  const isHashing = selectedFile && !torrentState.ready
  const hashProgress = torrentState.hashingProgress

  const handleUrlSubmit = (formData: FormData) => {
    const videoUrl = formData.get('video_url') as string
    onUrlSubmit(videoUrl)
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    if (localFile) {
      URL.revokeObjectURL(localFile.url)
    }
    const blobUrl = URL.createObjectURL(file)
    const newLocalFile = { url: blobUrl, type: file.type || 'video/mp4' }
    setLocalFile(newLocalFile)

    try {
      const magnetUri = await seedFile(file)
      onFileReady({ magnetUri, localFile: newLocalFile })
    } catch (error) {
      console.error('Error creating torrent:', error)
    }
  }

  useEffect(() => {
    if (!isSeeding || !selectedFile) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSeeding, selectedFile])

  useEffect(() => {
    return () => {
      if (localFile) {
        URL.revokeObjectURL(localFile.url)
      }
    }
  }, [localFile])

  return (
    <div className='w-full max-w-md bg-card p-6 rounded-lg shadow-lg border'>
      <form className='flex flex-col gap-4' action={handleUrlSubmit}>
        <div className='flex flex-col gap-3'>
          <div className='flex gap-1 border rounded-md p-1 w-fit'>
            <Button
              type='button'
              variant={inputMode === 'url' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setInputMode('url')}
            >
              URL
            </Button>
            <Button
              type='button'
              variant={inputMode === 'file' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setInputMode('file')}
            >
              File
            </Button>
          </div>

          {inputMode === 'url' ? (
            <div className='flex flex-col gap-2 flex-1'>
              <Label htmlFor='video_url' className='flex items-center gap-2'>
                Video URL
                <span className='ml-1 text-xs text-muted-foreground'>
                  (supports Youtube and Vimeo only)
                </span>
              </Label>
              <div className='relative'>
                <Input
                  type='url'
                  placeholder='https://www.youtube.com/watch?v=19aPQJ2HYc8'
                  name='video_url'
                  id='video_url'
                  required={true}
                  defaultValue={defaultVideoUrl}
                  className='transition-all focus:ring-2 focus:ring-primary/20'
                />
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-2 flex-1'>
              <Label htmlFor='file_input' className='flex items-center gap-2'>
                Upload File
              </Label>
              <div>
                <div className='relative'>
                  <Input
                    type='file'
                    id='file_input'
                    accept='video/*,audio/*'
                    onChange={handleFileSelect}
                    className={cn(
                      'transition-all focus:ring-2 focus:ring-primary/20',
                      isHashing && 'h-10'
                    )}
                  />
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isHashing ? 6 : 0,
                      opacity: isHashing ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className='w-[calc(100%-2px)] bg-muted rounded-b-[5px] overflow-hidden absolute bottom-px left-px'
                  >
                    <motion.div
                      className='h-full bg-foreground'
                      initial={{ width: 0 }}
                      animate={{
                        width: `${hashProgress * 100}%`
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </motion.div>
                </div>

                {selectedFile && (
                  <div className='mt-2 space-y-1'>
                    <p className='text-xs text-muted-foreground'>
                      {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {isSeeding && (
                      <div className='flex items-center gap-3 text-xs'>
                        <span className='flex items-center gap-1 text-green-500'>
                          <Upload className='h-3 w-3' />
                          Seeding
                        </span>
                        <span className='flex items-center gap-1 text-muted-foreground'>
                          <Users className='h-3 w-3' />
                          {torrentState.numPeers} peers
                        </span>
                        <span className='text-muted-foreground'>
                          ↑ {formatSpeed(torrentState.uploadSpeed)}
                        </span>
                      </div>
                    )}
                    {torrentState.error && (
                      <p className='text-xs text-red-500'>
                        {torrentState.error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {inputMode === 'url' && (
          <Button type='submit' className='w-full'>
            Update Video
          </Button>
        )}
      </form>
    </div>
  )
}
