'use client'

import { useEffect, useOptimistic, startTransition } from 'react'
import { Tables } from '@/types/supabase'
import { revalidatePathOnServer } from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/client'

export function useRoomRealtimeUpdates(
  roomData: Tables<'room'>,
  roomProfile: Tables<'user'>
) {
  const [optimisticRoomData, addOptimisticRoomData] = useOptimistic<
    Tables<'room'>,
    Partial<Tables<'room'>>
  >(
    roomData,
    (state, newState) => ({ ...state, ...newState }) as Tables<'room'>
  )

  const roomId = optimisticRoomData.id

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:updates`)
      .on('broadcast', { event: 'room-updates' }, async ({ payload }) => {
        if (payload.current_streamer_id === roomProfile.id) return

        startTransition(() => {
          addOptimisticRoomData(payload)
        })
        await revalidatePathOnServer(`/room/${roomId}`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return optimisticRoomData
}
