import { Skeleton } from './ui/skeleton'

export default function RoomLoadingState() {
  return (
    <div className='flex flex-col md:flex-row items-center justify-center h-dvh w-full'>
      <div className='flex flex-1 min-h-75 h-full w-full bg-black'>
        <Skeleton className='w-full h-full rounded-none bg-white/5' />
      </div>
      <div className='h-full w-full md:w-[40vw] lg:w-[25vw] border-t md:border-l md:border-t-0 border-hairline'>
        <div className='flex flex-col h-full'>
          <div className='aqua-chrome flex h-11 px-3 items-center justify-end border-b border-hairline'>
            <Skeleton className='h-8 w-20.75 aqua-push' />
          </div>

          <div className='aqua-well flex flex-1 flex-col justify-end gap-2 bg-background p-3'>
            <Skeleton className='h-3.5 w-3/5 bg-foreground/10' />
            <Skeleton className='h-3.5 w-4/5 bg-foreground/10' />
            <Skeleton className='h-3.5 w-2/5 bg-foreground/10' />
            <Skeleton className='h-3.5 w-3/4 bg-foreground/10' />
          </div>

          <div className='aqua-chrome flex gap-2 border-t border-hairline p-3'>
            <Skeleton className='h-8 flex-1 aqua-field' />
            <Skeleton className='size-8 shrink-0 aqua-default' />
          </div>
        </div>
      </div>
    </div>
  )
}
