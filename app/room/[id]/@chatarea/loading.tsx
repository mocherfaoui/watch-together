import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className='hidden md:block right-0 top-0 h-full w-[80vw] md:w-[30vw] lg:w-[25vw] border-l border-gray-200'>
      <div className='min-h-[61px] flex border-b border-gray-200 p-4 px-3 items-center'>
        <Skeleton className='h-[28px] w-[140px]' />
      </div>
    </div>
  )
}
