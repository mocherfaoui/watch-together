'use server'

import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { revalidatePath } from 'next/cache'
import { Tables } from '@/types/supabase'
import { BroadcastMessage } from '@/types'
import { generateUsername, getRandomVideo } from '.'

export const handleCreateRoom = async (
  state: {
    error: string
    formData: { username: string; video_url: string }
  } | null,
  formData: FormData
): Promise<{
  error: string
  formData: { username: string; video_url: string }
} | null> => {
  let roomData: Tables<'room'> | null = null
  const username = formData.get('username') as string
  const videoUrl = formData.get('video_url') as string

  try {
    const supabase = await createClient()

    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return {
        error: 'User not authenticated',
        formData: { username, video_url: videoUrl }
      }
    }

    // set room to expire in 6 hours by default
    const expiresAt = new Date()
    expiresAt.setUTCHours(expiresAt.getUTCHours() + 6)

    const { data: roomDataResponse, error: roomError } = await supabase
      .from('room')
      .insert({
        video_url: videoUrl,
        host_id: currentUser.id,
        stream_id: '',
        stream_output: '',
        stream_input: '',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (roomError) {
      console.error('Error creating room:', roomError)
      return {
        error: 'Failed to create room',
        formData: { username, video_url: videoUrl }
      }
    }

    roomData = roomDataResponse

    await createRoomProfile({
      roomId: roomData.id,
      isHost: true,
      authId: currentUser.id
    })
  } catch (error) {
    console.error('Error in handleCreateRoom:', error)
    return {
      error: 'An unexpected error occurred',
      formData: { username, video_url: videoUrl }
    }
  } finally {
    if (roomData) {
      redirect(`/room/${roomData.id}`)
    }
    return null
  }
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
  isHost,
  authId
}: {
  roomId: string
  isHost: boolean
  authId: string | undefined
}) {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('user')
      .insert({
        name: generateUsername(),
        auth_id: authId ?? '',
        room_id: roomId,
        is_host: isHost
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating room profile:', error)
      throw new Error('Failed to create room profile')
    }

    return profile
  } catch (error) {
    console.error('Error in createRoomProfile:', error)
    throw error
  }
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

  const { error } = await supabase
    .from('room')
    .delete()
    .eq('id', roomId)
    .select()
    .single()

  if (error) {
    return { error: 'an error occured, please try again' }
  }

  redirect('/')
}

export async function getOrCreateDemoRoom(): Promise<Tables<'room'>> {
  const supabase = await createClient()
  const DEMO_ROOM_ID = 'demo'

  const { data: existingRoom } = await supabase
    .from('room')
    .select()
    .eq('id', DEMO_ROOM_ID)
    .single()

  if (existingRoom) {
    return existingRoom
  }

  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  const { data: newRoom, error } = await supabase
    .from('room')
    .insert({
      id: DEMO_ROOM_ID,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      host_id: currentUser?.id ?? null,
      stream_id: '',
      stream_output: '',
      stream_input: '',
      expires_at: null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating demo room:', error)
    throw new Error('Failed to create demo room')
  }

  return newRoom
}

export async function checkRoomExists(roomId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('room')
    .select('id')
    .eq('id', roomId)
    .single()

  return !!data
}

export async function getOrCreateUserRoom(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('User not authenticated')
  }

  const expiresAt = new Date()
  expiresAt.setUTCHours(expiresAt.getUTCHours() + 6)

  const { data: roomDataResponse, error: roomError } = await supabase
    .from('room')
    .insert({
      video_url: getRandomVideo(),
      host_id: currentUser.id,
      stream_id: '',
      stream_output: '',
      stream_input: '',
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (roomError) {
    console.error('Error creating room:', roomError)
    throw new Error('Failed to create room')
  }

  return roomDataResponse.id
}
