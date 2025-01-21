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

export type BroadcastMessage = {
  room: string
  event: 'new-message' | 'playback-state' | 'room-updates'
  payload:
    | (NonNullableKeys<Omit<Tables<'message'>, 'sender'>> & {
        sender: Tables<'user'>
      })
    | { isPlaying: boolean }
    | Partial<Tables<'room'>>
}

export type StreamState = 'streaming' | 'not started'
