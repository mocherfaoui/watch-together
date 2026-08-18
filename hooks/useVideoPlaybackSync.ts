'use client'

import { useCallback, useEffect, useRef, startTransition } from 'react'
import type { RefObject } from 'react'
import { Tables } from '@/types/supabase'
import { PLAYBACK_MESSAGE, PlaybackStatePayload } from '@/types'
import { generateUUID } from '@/utils'
import { setPlaybackState } from '@/utils/server-actions'
import { createClient } from '@/utils/supabase/client'
import type { MediaPlayerInstance } from '@vidstack/react'

type UseVideoPlaybackSyncOptions = {
  roomData: Tables<'room'>
  roomProfile: Tables<'user'>
  roomId: string
  addOptimisticMessages: (action: object) => void
  videoPlayerRef: RefObject<MediaPlayerInstance | null>
}

export function useVideoPlaybackSync({
  roomData,
  roomProfile,
  roomId,
  addOptimisticMessages,
  videoPlayerRef
}: UseVideoPlaybackSyncOptions) {
  const isRemoteSync = useRef(false)
  const lastAppliedVersion = useRef(roomData.playback_version ?? 0)

  const applyPlaybackState = useCallback(
    async (isPlaying: boolean, version: number) => {
      if (version <= lastAppliedVersion.current) return

      lastAppliedVersion.current = version
      isRemoteSync.current = true

      try {
        if (isPlaying) {
          await videoPlayerRef.current?.play()
        } else {
          await videoPlayerRef.current?.pause()
        }
      } finally {
        isRemoteSync.current = false
      }
    },
    [videoPlayerRef]
  )

  const handlePlaybackChange = useCallback(
    async (isPlaying: boolean) => {
      if (isRemoteSync.current) return

      const messageId = generateUUID()
      const content = isPlaying
        ? PLAYBACK_MESSAGE.played
        : PLAYBACK_MESSAGE.paused

      startTransition(() => {
        addOptimisticMessages({
          id: messageId,
          content,
          sender: { id: roomProfile.id, name: roomProfile.name },
          room_id: roomId,
          sent_at: new Date().toISOString()
        })
      })

      const result = await setPlaybackState(
        roomId,
        isPlaying,
        roomProfile,
        messageId
      )

      if (result) {
        await applyPlaybackState(result.isPlaying, result.version)
      }
    },
    [addOptimisticMessages, applyPlaybackState, roomId, roomProfile]
  )

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:updates`)
      .on('broadcast', { event: 'playback-state' }, async ({ payload }) => {
        const { isPlaying, version } = payload as PlaybackStatePayload
        await applyPlaybackState(isPlaying, version)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [applyPlaybackState, roomId])

  useEffect(() => {
    void applyPlaybackState(
      roomData.is_playing ?? false,
      roomData.playback_version ?? 0
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    handlePlay: () => {
      void handlePlaybackChange(true)
    },
    handlePause: () => {
      void handlePlaybackChange(false)
    }
  }
}
