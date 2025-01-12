import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className='flex flex-col flex-[70vh] gap-3'>
      {/* Video URL Input Skeleton */}
      <div className='w-full border-b border-gray-200 p-3'>
        <Skeleton className='w-full h-[42px] rounded-md' />
      </div>

      {/* Video Player Area Skeleton */}
      <div className='flex-1 min-h-[300px] p-3 pt-0'>
        <div className='pt-[56.25%] relative h-full'>
          <Skeleton className='absolute top-0 left-0 w-full h-full' />
        </div>
      </div>
    </div>
  )
}
