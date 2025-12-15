import HomepageDemo from '@/components/homepage-demo'
import { getOrCreateDemoRoom, createRoomProfile } from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const roomData = await getOrCreateDemoRoom()
  const supabase = await createClient()

  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  const getRoomProfile = async () => {

    const { data: roomProfile } = await supabase
      .from('user')
      .select()
      .eq('auth_id', currentUser!.id)
      .eq('room_id', roomData.id)
      .single()

    if (roomProfile) return roomProfile

    const newRoomProfile = await createRoomProfile({
      roomId: roomData.id,
      userName: '',
      isHost: false,
      hostId: currentUser!.id
    })

    return newRoomProfile
  }

  const roomProfile = await getRoomProfile()

  const { data: messages } = await supabase
    .from('message')
    .select(`*, sender(id, name)`)
    .eq('room_id', roomData.id)

  return (
    <main>
      <HomepageDemo
        roomData={roomData}
        roomProfile={roomProfile}
        messages={messages}
      />
    </main>
  )
}
