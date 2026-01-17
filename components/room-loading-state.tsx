import { Skeleton } from './ui/skeleton'

export default function RoomLoadingState() {
  return (
    <div className='flex flex-col md:flex-row items-center justify-center h-screen w-full'>
      <div className='flex flex-1 min-h-[300px] h-full w-full'>
        <Skeleton className='w-full h-full rounded-none' />
      </div>
      <div className='bg-white h-full w-full md:w-[40vw] lg:w-[25vw] border-t md:border-l md:border-t-0 border-gray-200'>
        <div className='flex p-4 px-3 items-center justify-end'>
          <Skeleton className='h-[36px] w-[83px]' />
        </div>
      </div>
    </div>
  )
}
