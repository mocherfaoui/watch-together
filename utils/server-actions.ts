'use server'

import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { revalidatePath } from 'next/cache'
import { Tables } from '@/types/supabase'
import { BroadcastMessage } from '@/types'

export const handleCreateRoom = async (
  _formState: null,
  formData: FormData
) => {
  const supabase = await createClient()

  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  const userName = formData.get('username') as string

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
      }
    }
  )
  const cloudflareResponse = await response.json()

  const { data: roomData } = await supabase
    .from('room')
    .insert({
      video_url: formData.get('video_url') as string,
      host_id: currentUser?.id,
      stream_id: cloudflareResponse?.result.uid ?? '',
      stream_output: cloudflareResponse?.result.webRTCPlayback.url ?? '',
      stream_input: cloudflareResponse?.result.webRTC.url ?? ''
    })
    .select()
    .single()

  await createRoomProfile({
    roomId: roomData!.id,
    userName,
    isHost: true,
    hostId: currentUser?.id
  })

  redirect(`/room/${roomData!.id}`)
}

export const updateRoom = async (
  roomId: string,
  payload: Partial<Tables<'room'>>
) => {
  const supabase = await createClient()

  await supabase.from('room').update(payload).eq('id', roomId)

  await broadcastMessage({
    event: 'room-updates',
    room: `room:${roomId}:updates`,
    payload
  })

  revalidatePath(`/room/${roomId}`)
}

export async function revalidatePathOnServer(path: string) {
  revalidatePath(path)
}

export async function createRoomProfile({
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
    .insert({
      name: userName,
      auth_id: hostId ?? '',
      room_id: roomId,
      is_host: isHost
    })
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
  newMessage: Tables<'message'>,
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
  revalidatePath(`/room/${newMessage.room_id}`)
}

export const sendNewUserMessage = async (
  newMessage: Tables<'message'>,
  userName: string,
  roomProfile: Tables<'user'>
) => {
  const supabase = await createClient()

  await supabase
    .from('user')
    .update({ name: userName })
    .eq('id', roomProfile.id)

  const { error } = await supabase.from('message').insert(newMessage)

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
      sender: { ...roomProfile, name: userName }
    }
  })
  revalidatePath(`/room/${newMessage.room_id}`)
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

  revalidatePath(`/room/${roomProfile.room_id}`)

  return {
    error: '',
    payload: newUserName
  }
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('room')
    .delete()
    .eq('id', roomId)
    .select()
    .single()

  if (error) {
    return { error: 'an error occured, please try again' }
  }

  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${data.stream_id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
      }
    }
  )
  redirect('/')
}

async function getCloudflareStream(liveInputId: string | null) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${liveInputId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
      }
    }
  )
  const data = await response.json()
  return data
}

export async function checkLiveStreamConnectionStatus(
  liveInputId: string | null
) {
  const data = await getCloudflareStream(liveInputId)
  return data.result?.status.current.state === 'connected'
}
