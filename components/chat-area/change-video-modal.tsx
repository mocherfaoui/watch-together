'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '../ui/drawer'
import ChangeVideoForm, { CHANGE_VIDEO_TITLE } from '../change-video-form'

type ChangeVideoModalProps = {
  defaultVideoUrl: string
  onUrlSubmit: (videoUrl: string) => void
  onFileReady: (data: {
    magnetUri: string
    localFile: { url: string; type: string }
  }) => void
}

const ChangeVideoModal = ({
  defaultVideoUrl,
  onUrlSubmit,
  onFileReady
}: ChangeVideoModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant='outline'
        onClick={() => setIsOpen(true)}
        className='md:hidden'
        data-umami-event='Open Change Video Sheet button'
      >
        <span>Change Video</span>
      </Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction='bottom'>
        <DrawerContent className='max-h-[85svh] pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <DrawerTitle className='sr-only'>{CHANGE_VIDEO_TITLE}</DrawerTitle>
          <div className='overflow-y-auto px-4 pb-4'>
            <ChangeVideoForm
              defaultVideoUrl={defaultVideoUrl}
              onUrlSubmit={(url) => {
                onUrlSubmit(url)
                setIsOpen(false)
              }}
              onFileReady={(data) => {
                onFileReady(data)
                setIsOpen(false)
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ChangeVideoModal
