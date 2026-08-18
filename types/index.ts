import { Tables } from './supabase'

export type NonNullableKeys<T> = {
  [K in keyof T]: NonNullable<T[K]>
}

export type ModifiedMessageType =
  | (Omit<Tables<'message'>, 'sender'> & {
      sender:
        | (string & {
            id: string
            name: string | null
          })
        | null
    })[]
  | null

export type PlaybackStatePayload = {
  isPlaying: boolean
  version: number
  userId: string
}

export const PLAYBACK_MESSAGE = {
  played: 'played the video',
  paused: 'paused the video'
} as const

export type BroadcastMessage = {
  room: string
  event: 'new-message' | 'playback-state' | 'room-updates'
  payload:
    | (NonNullableKeys<Omit<Tables<'message'>, 'sender'>> & {
        sender: Tables<'user'>
      })
    | PlaybackStatePayload
    | Partial<Tables<'room'>>
}
