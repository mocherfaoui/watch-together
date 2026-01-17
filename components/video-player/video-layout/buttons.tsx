import {
  CaptionButton,
  FullscreenButton,
  isTrackCaptionKind,
  MuteButton,
  PlayButton,
  Tooltip,
  useMediaState,
  type TooltipPlacement
} from '@vidstack/react'
import {
  CaptionsIcon,
  CaptionsOff,
  Maximize,
  Minimize,
  Pause,
  Play as PlayIcon,
  Volume1,
  Volume2,
  VolumeOff
} from 'lucide-react'

export interface MediaButtonProps {
  tooltipPlacement: TooltipPlacement
}

export const buttonClass =
  'group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-focus:ring-4'

export const tooltipClass =
  'animate-out fade-out slide-out-to-bottom-2 data-[visible]:animate-in data-[visible]:fade-in data-[visible]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white parent-data-open:hidden'

export function Play({ tooltipPlacement }: MediaButtonProps) {
  const isPaused = useMediaState('paused')
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <PlayButton className={buttonClass}>
          {isPaused ? (
            <PlayIcon className='fill-current w-6 h-6' />
          ) : (
            <Pause className=' fill-current w-6 h-6' />
          )}
        </PlayButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
        {isPaused ? 'Play' : 'Pause'}
      </Tooltip.Content>
    </Tooltip.Root>
  )
}

export function Mute({ tooltipPlacement }: MediaButtonProps) {
  const volume = useMediaState('volume'),
    isMuted = useMediaState('muted')
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <MuteButton className={buttonClass}>
          {isMuted || volume == 0 ? (
            <VolumeOff className='w-6 h-6' />
          ) : volume < 0.5 ? (
            <Volume1 className='w-6 h-6' />
          ) : (
            <Volume2 className='w-6 h-6' />
          )}
        </MuteButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
        {isMuted ? 'Unmute' : 'Mute'}
      </Tooltip.Content>
    </Tooltip.Root>
  )
}

export function Caption({ tooltipPlacement }: MediaButtonProps) {
  const hasTracks = useMediaState('textTracks')
  const track = useMediaState('textTrack')

  if (!hasTracks.length) return

  const isOn = track && isTrackCaptionKind(track)
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <CaptionButton className={buttonClass}>
          {isOn ? (
            <CaptionsOff className='w-6 h-6' />
          ) : (
            <CaptionsIcon className='w-6 h-6' />
          )}
        </CaptionButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
        {isOn ? 'Closed-Captions Off' : 'Closed-Captions On'}
      </Tooltip.Content>
    </Tooltip.Root>
  )
}

export function Fullscreen({ tooltipPlacement }: MediaButtonProps) {
  const isActive = useMediaState('fullscreen')
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <FullscreenButton className={buttonClass}>
          {isActive ? (
            <Minimize className='w-6 h-6' />
          ) : (
            <Maximize className='w-6 h-6' />
          )}
        </FullscreenButton>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
        {isActive ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </Tooltip.Content>
    </Tooltip.Root>
  )
}
