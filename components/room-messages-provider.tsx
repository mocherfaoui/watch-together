'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode
} from 'react'
import { createClient } from '@/utils/supabase/client'
import { Tables } from '@/types/supabase'
import { NonNullableKeys } from '@/types'

export type NewMessagePayload = NonNullableKeys<
  Omit<Tables<'message'>, 'sender'>
> & {
  sender: Tables<'user'>
}

type Handler = (payload: NewMessagePayload) => void

type RoomMessagesContextValue = {
  subscribeToNewMessages: (handler: Handler) => () => void
}

const RoomMessagesContext = createContext<RoomMessagesContextValue | null>(null)

export function RoomMessagesProvider({
  roomId,
  children
}: {
  roomId: string
  children: ReactNode
}) {
  const handlersRef = useRef<Set<Handler>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:messages`)
      .on('broadcast', { event: 'new-message' }, ({ payload }) => {
        handlersRef.current.forEach((handler) =>
          handler(payload as NewMessagePayload)
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const subscribeToNewMessages = useCallback((handler: Handler) => {
    handlersRef.current.add(handler)
    return () => {
      handlersRef.current.delete(handler)
    }
  }, [])

  return (
    <RoomMessagesContext.Provider value={{ subscribeToNewMessages }}>
      {children}
    </RoomMessagesContext.Provider>
  )
}

export function useRoomMessages() {
  const ctx = useContext(RoomMessagesContext)
  if (!ctx) {
    throw new Error('useRoomMessages must be used within RoomMessagesProvider')
  }
  return ctx
}
