import ChatArea from '@/components/chat-area'
import VideoPlayer from '@/components/video-player'
import { createRoomProfile } from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function RoomPage({
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

  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  const getRoomProfile = async () => {
    const { data: roomProfile } = await supabase
      .from('user')
      .select()
      .eq('auth_id', currentUser!.id)
      .eq('room_id', roomId)
      .single()

    if (roomProfile) return roomProfile

    const newRoomProfile = await createRoomProfile({
      roomId,
      userName: '',
      isHost: false,
      hostId: currentUser?.id
    })

    return newRoomProfile
  }

  const roomProfile = await getRoomProfile()

  const { data: messages } = await supabase
    .from('message')
    .select(`*, sender(id, name)`)
    .eq('room_id', roomId)

  return (
    <>
      <VideoPlayer roomData={roomData} roomProfile={roomProfile} />
      <ChatArea roomProfile={roomProfile} messages={messages} roomId={roomId} />
    </>
  )
}
