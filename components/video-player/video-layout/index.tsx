import { Captions, Controls, Gesture } from '@vidstack/react'

import * as Buttons from './buttons'
import * as Menus from './menus'
import * as Sliders from './sliders'
import { TimeGroup } from './time-group'
import { Title } from './title'

import '@vidstack/react/player/styles/default/captions.css'

export function VideoLayout() {
  return (
    <div className='text-white'>
      <Gestures />
      <Captions className='vds-captions media-preview:opacity-0 media-controls:bottom-[104px] media-captions:opacity-100 absolute inset-0 bottom-2 z-10 select-none wrap-break-word opacity-0 transition-[opacity,bottom] duration-300' />
      <Controls.Root className='media-controls:opacity-100 absolute inset-0 z-10 flex h-full w-full flex-col opacity-0 transition-opacity'>
        <div className='flex-1' />
        <div className='px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
          <div className='aqua-player-chrome rounded-[8px] px-2 pb-1.5 pt-1'>
            <Controls.Group className='flex w-full items-center'>
              <Sliders.Time />
            </Controls.Group>
            <Controls.Group className='-mt-1 flex w-full items-center'>
              <Buttons.Play tooltipPlacement='top start' />
              <Buttons.Mute tooltipPlacement='top' />
              <Sliders.Volume />
              <TimeGroup />
              <Title />
              <Buttons.Caption tooltipPlacement='top' />
              <Menus.Settings placement='top end' tooltipPlacement='top' />
              <Buttons.Fullscreen tooltipPlacement='top end' />
            </Controls.Group>
          </div>
        </div>
      </Controls.Root>
    </div>
  )
}

function Gestures() {
  return (
    <>
      <Gesture
        className='absolute inset-0 z-0 block h-full w-full'
        event='pointerup'
        action='toggle:paused'
      />
      <Gesture
        className='absolute inset-0 z-0 block h-full w-full'
        event='dblpointerup'
        action='toggle:fullscreen'
      />
      <Gesture
        className='absolute left-0 top-0 z-10 block h-full w-1/5'
        event='dblpointerup'
        action='seek:-10'
      />
      <Gesture
        className='absolute right-0 top-0 z-10 block h-full w-1/5'
        event='dblpointerup'
        action='seek:10'
      />
    </>
  )
}
