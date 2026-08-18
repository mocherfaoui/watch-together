import { TimeSlider, VolumeSlider } from '@vidstack/react'

const trackClass =
  'aqua-track relative ring-media-focus z-0 h-[9px] w-full rounded-full group-data-focus:ring-[3px]'

const fillClass = 'aqua-fill absolute h-full rounded-full will-change-[width]'

const thumbClass =
  'aqua-knob absolute left-(--slider-fill) top-1/2 z-20 size-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-white/40 group-data-dragging:ring-4 will-change-[left]'

const previewClass =
  'flex flex-col items-center opacity-0 transition-opacity duration-200 data-visible:opacity-100 pointer-events-none'

export function Volume() {
  return (
    <VolumeSlider.Root className='volume-slider group relative mx-[7.5px] inline-flex h-8 w-full max-w-[80px] cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden'>
      <VolumeSlider.Track className={trackClass}>
        <VolumeSlider.TrackFill className={`${fillClass} w-(--slider-fill)`} />
      </VolumeSlider.Track>

      <VolumeSlider.Preview className={previewClass} noClamp>
        <VolumeSlider.Value className='aqua-player-chrome rounded-sm px-2 py-px text-xs font-medium tabular-nums' />
      </VolumeSlider.Preview>
      <VolumeSlider.Thumb className={thumbClass} />
    </VolumeSlider.Root>
  )
}

export function Time() {
  return (
    <TimeSlider.Root className='time-slider group relative mx-[7.5px] inline-flex h-8 w-full cursor-pointer touch-none select-none items-center outline-none isolate'>
      <TimeSlider.Chapters className='relative flex h-full w-full items-center rounded-[1px]'>
        {(cues, forwardRef) =>
          cues.map((cue) => (
            <div
              className='last-child:mr-0 relative mr-0.5 flex h-full w-full items-center rounded-[1px]'
              style={{ contain: 'layout style' }}
              key={cue.startTime}
              ref={forwardRef}
            >
              <TimeSlider.Track className={trackClass}>
                <TimeSlider.Progress className='absolute h-full w-(--chapter-progress) rounded-full bg-white/25 will-change-[width]' />
                <TimeSlider.TrackFill
                  className={`${fillClass} w-(--chapter-fill)`}
                />
              </TimeSlider.Track>
            </div>
          ))
        }
      </TimeSlider.Chapters>

      <TimeSlider.Thumb className={thumbClass} />

      <TimeSlider.Preview className={previewClass}>
        <TimeSlider.ChapterTitle className='mt-2 text-sm' />
        <TimeSlider.Value className='text-xs tabular-nums' />
      </TimeSlider.Preview>
    </TimeSlider.Root>
  )
}
