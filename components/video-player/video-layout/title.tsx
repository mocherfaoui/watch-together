import { Title as VideoTitle } from '@vidstack/react'

export function Title() {
  return (
    <span className='inline-block flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm font-medium text-white'>
      <span className='mr-2'>|</span>
      <VideoTitle />
    </span>
  )
}
