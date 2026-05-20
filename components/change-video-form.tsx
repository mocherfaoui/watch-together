'use client'

import UpdateRoomForm from './update-room-form'

export const CHANGE_VIDEO_TITLE = 'Change Video'

type ChangeVideoFormProps = {
  defaultVideoUrl: string
  onUrlSubmit: (videoUrl: string) => void
  onFileReady: (data: {
    magnetUri: string
    localFile: { url: string; type: string }
  }) => void
}

export default function ChangeVideoForm({
  defaultVideoUrl,
  onUrlSubmit,
  onFileReady
}: ChangeVideoFormProps) {
  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-left mb-6 md:text-center md:mb-12'>
        <h2 className='text-xl font-semibold text-foreground md:text-5xl md:font-bold md:leading-[1.1] md:text-transparent md:bg-clip-text md:bg-linear-to-r md:from-white md:to-white/60'>
          {CHANGE_VIDEO_TITLE}
        </h2>
      </div>
      <UpdateRoomForm
        defaultVideoUrl={defaultVideoUrl}
        onUrlSubmit={onUrlSubmit}
        onFileReady={onFileReady}
      />
    </div>
  )
}
