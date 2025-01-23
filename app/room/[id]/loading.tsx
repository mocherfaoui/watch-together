import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <div className='flex flex-col flex-1'>
        <div className='w-full border-b border-gray-200 p-3'>
          <Skeleton className='w-full h-[36px] rounded-md' />
        </div>
        <div className='flex-1 min-h-[300px]'>
          <Skeleton className='w-full h-full rounded-none' />
        </div>
      </div>
      <div className='bg-white h-full w-full md:w-[40vw] lg:w-[25vw] border-t md:border-l md:border-t-0 border-gray-200'>
        <div className='min-h-[61px] flex border-b border-gray-200 p-4 px-3 items-center'>
          <Skeleton className='h-[28px] w-[140px]' />
        </div>
      </div>
    </>
  )
}
