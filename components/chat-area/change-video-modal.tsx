'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet'
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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side='bottom'
          className='max-h-[85svh] overflow-y-auto rounded-t-xl'
        >
          <SheetTitle className='sr-only'>{CHANGE_VIDEO_TITLE}</SheetTitle>
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
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ChangeVideoModal
