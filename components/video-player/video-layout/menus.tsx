import {
  type IconComponent,
  Menu,
  Tooltip,
  useCaptionOptions,
  usePlaybackRateOptions,
  type MenuPlacement,
  type TooltipPlacement
} from '@vidstack/react'

import { buttonClass, tooltipClass } from './buttons'
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Circle,
  Gauge,
  Settings as SettingsIcon
} from 'lucide-react'

export interface SettingsProps {
  placement: MenuPlacement
  tooltipPlacement: TooltipPlacement
}

export const menuClass =
  'animate-out fade-out slide-out-to-bottom-2 data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4 flex h-[var(--menu-height)] max-h-[400px] min-w-[260px] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-[15px] font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] data-[resizing]:overflow-hidden'

export const submenuClass =
  'hidden w-full flex-col items-start justify-center outline-none data-[keyboard]:mt-[3px] data-[open]:inline-block'

export function Settings({ placement, tooltipPlacement }: SettingsProps) {
  return (
    <Menu.Root className='parent'>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Menu.Button className={buttonClass}>
            <SettingsIcon className='h-6 w-6 transform transition-transform duration-200 ease-out group-data-[open]:rotate-90' />
          </Menu.Button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
          Settings
        </Tooltip.Content>
      </Tooltip.Root>
      <Menu.Content className={menuClass} placement={placement}>
        <CaptionSubmenu />
        <SpeedSubmenu />
      </Menu.Content>
    </Menu.Root>
  )
}

function SpeedSubmenu() {
  const options = usePlaybackRateOptions(),
    hint =
      options.selectedValue === '1' ? 'Normal' : options.selectedValue + 'x'
  return (
    <Menu.Root>
      <SubmenuButton
        disabled={options.disabled}
        icon={Gauge}
        hint={hint}
        label='Speed'
      />
      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          value={options.selectedValue}
          className='w-full flex flex-col'
        >
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  )
}

function CaptionSubmenu() {
  const options = useCaptionOptions(),
    hint = options.selectedTrack?.label ?? 'Off'
  return (
    <Menu.Root>
      <SubmenuButton
        label='Captions'
        hint={hint}
        disabled={options.disabled}
        icon={Captions}
      />
      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className='w-full flex flex-col'
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  )
}

function Radio({ children, ...props }: Menu.RadioProps) {
  return (
    <Menu.Radio
      className='ring-media-focus group relative flex w-full cursor-pointer select-none items-center justify-start rounded-sm p-2.5 outline-none data-[hocus]:bg-white/10 data-[focus]:ring-[3px]'
      {...props}
    >
      <Circle className='h-3 w-3 text-white group-data-[checked]:hidden' />
      <Circle className='fill-current text-white hidden h-3 w-3 group-data-[checked]:block p-[1px] rounded-full border border-white' />
      <span className='ml-2 text-sm'>{children}</span>
    </Menu.Radio>
  )
}

export interface SubmenuButtonProps {
  label: string
  hint: string
  disabled?: boolean
  icon: React.ElementType | IconComponent
}

function SubmenuButton({
  label,
  hint,
  icon: Icon,
  disabled
}: SubmenuButtonProps) {
  return (
    <Menu.Button
      className='ring-media-focus parent left-0 z-10 flex w-full cursor-pointer select-none items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none ring-inset data-[open]:sticky data-[open]:-top-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-[3px] aria-disabled:hidden'
      disabled={disabled}
    >
      <ChevronLeft className='parent-data-[open]:block -ml-0.5 mr-1.5 hidden h-[18px] w-[18px]' />
      <div className='contents parent-data-[open]:hidden'>
        <Icon className='w-5 h-5' />
      </div>
      <span className='ml-1.5 parent-data-[open]:ml-0'>{label}</span>
      <span className='ml-auto text-sm text-white/50'>{hint}</span>
      <ChevronRight className='parent-data-[open]:hidden ml-0.5 h-[18px] w-[18px] text-sm text-white/50' />
    </Menu.Button>
  )
}
