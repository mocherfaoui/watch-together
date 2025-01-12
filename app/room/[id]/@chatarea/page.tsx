import ChatArea from '@/components/chat-area'
import { createClient } from '@/utils/supabase/server'

export default async function ChatAreaSlot({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const roomId = (await params).id
  const supabase = await createClient()
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  const getNewUser = async () => {
    const {
      data: { user: newUser }
    } = await supabase.auth.signInAnonymously()
    return newUser
  }

  const user = currentUser ?? (await getNewUser())

  const { data: roomProfile } = await supabase
    .from('user')
    .select()
    .eq('auth_id', user!.id)
    .eq('room_id', roomId)
    .single()

  const { data: messages } = await supabase
    .from('message')
    .select(`*, sender(id, name)`)
    .eq('room_id', roomId)

  return (
    <ChatArea roomProfile={roomProfile} messages={messages} roomId={roomId} />
  )
}
