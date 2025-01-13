'use server'

import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { revalidatePath } from 'next/cache'
import { Tables } from '@/types/supabase'
import { BroadcastMessage } from '@/types'

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  const authUser =
    currentUser ??
    (await (async () => {
      const {
        data: { user }
      } = await supabase.auth.signInAnonymously()
      return user
    })())

  return authUser
}

export const handleCreateRoom = async (
  _formState: null,
  formData: FormData
) => {
  const supabase = await createClient()

  const currentUser = await getCurrentUser()
  const userName = formData.get('username') as string

  const { data: roomData } = await supabase
    .from('room')
    .insert({
      video_url: formData.get('video_url') as string,
      host_id: currentUser?.id
    })
    .select()
    .single()

  await upsertRoomProfile({
    roomId: roomData!.id,
    userName,
    isHost: true,
    hostId: currentUser?.id
  })

  redirect(`/room/${roomData!.id}`)
}

export const updateRoomVideo = async (videoUrl: string, roomId: string) => {
  const supabase = await createClient()

  await supabase.from('room').update({ video_url: videoUrl }).eq('id', roomId)

  revalidatePath(`/room/${roomId!}/@videoplayer`)
}

export async function revalidatePathOnServer(path: string) {
  revalidatePath(path)
}

export async function upsertRoomProfile({
  roomId,
  userName,
  isHost,
  hostId
}: {
  roomId: string
  userName: string
  isHost: boolean
  hostId: string | undefined
}) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('user')
    .upsert(
      {
        name: userName,
        auth_id: hostId ?? '',
        room_id: roomId,
        is_host: isHost
      },
      {
        onConflict: 'auth_id,room_id',
        ignoreDuplicates: false
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error creating/getting room profile:', error)
    throw error
  }

  return profile
}

export const broadcastMessage = async ({
  room,
  event,
  payload
}: BroadcastMessage) => {
  const supabase = await createClient()
  const channel = supabase.channel(room)

  channel.send({
    type: 'broadcast',
    event,
    payload
  })

  supabase.removeChannel(channel)
}

export const sendMessage = async (
  newMessage: Omit<Tables<'message'>, 'id'>,
  roomProfile: Tables<'user'>
) => {
  const supabase = await createClient()

  const { error } = await supabase.from('message').insert(newMessage)
  if (error) {
    return {
      error: 'an error occured, please try again',
      payload: {
        messageContent: newMessage.content
      }
    }
  }

  await broadcastMessage({
    room: `room:${newMessage.room_id}:messages`,
    event: 'new-message',
    payload: {
      ...newMessage,
      sender: roomProfile
    }
  })
  revalidatePath(`/room/${newMessage.room_id}/@chatarea`)
}

export const sendNewUserMessage = async (
  newMessage: Omit<Tables<'message'>, 'id' | 'sender'>,
  userName: string
) => {
  const supabase = await createClient()

  const currentUser = await getCurrentUser()

  const newRoomProfile = await upsertRoomProfile({
    roomId: newMessage.room_id,
    userName,
    isHost: false,
    hostId: currentUser?.id
  })

  const { error } = await supabase
    .from('message')
    .insert({ ...newMessage, sender: newRoomProfile?.id })

  if (error) {
    return {
      error: 'an error occured, please try again',
      payload: {
        userName,
        messageContent: newMessage.content
      }
    }
  }

  await broadcastMessage({
    room: `room:${newMessage.room_id}:messages`,
    event: 'new-message',
    payload: {
      ...newMessage,
      sender: newRoomProfile
    }
  })
  revalidatePath(`/room/${newMessage.room_id}/@chatarea`)
}

export async function updateUserName(
  newUserName: string,
  roomProfile: Tables<'user'>
) {
  const supabase = await createClient()

  const { data: alreadyUsed } = await supabase
    .from('user')
    .select('name')
    .eq('room_id', roomProfile.room_id)
    .eq('name', newUserName)
    .single()

  if (alreadyUsed?.name) {
    return {
      error: 'username already used',
      payload: newUserName
    }
  }

  const { error } = await supabase
    .from('user')
    .update({ name: newUserName })
    .eq('id', roomProfile.id)

  if (error) {
    return {
      error: 'an error occured, please try again',
      payload: newUserName
    }
  }

  revalidatePath(`/room/${roomProfile.room_id}/@chatarea`)

  return {
    error: '',
    payload: newUserName
  }
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('room').delete().eq('id', roomId)
  if (error) {
    return { error: 'an error occured, please try again' }
  }
  redirect('/')
}
