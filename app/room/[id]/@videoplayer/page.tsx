import VideoPlayer from '@/components/video-player'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function VideoPlayerSlot({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const roomId = (await params).id
  const supabase = await createClient()
  const { data: roomData } = await supabase
    .from('room')
    .select()
    .eq('id', roomId)
    .single()

  if (!roomData) {
    return notFound()
  }

  return <VideoPlayer roomData={roomData} />
}
