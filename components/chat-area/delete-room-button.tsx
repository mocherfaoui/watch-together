'use client'

import { useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls
} from 'motion/react'
import { deleteRoom } from '@/utils/server-actions'
import { cn } from '@/lib/utils'

const HOLD_DURATION_MS = 1500

type DeleteRoomButtonProps = {
  roomId: string
}

export default function DeleteRoomButton({ roomId }: DeleteRoomButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const progress = useMotionValue(0)
  const animationRef = useRef<AnimationPlaybackControls | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const triggerDelete = async () => {
    setIsDeleting(true)
    const result = await deleteRoom(roomId)
    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
      animate(progress, 0, { duration: 0.2, ease: 'easeOut' })
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (isDeleting) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setError('')

    animationRef.current?.stop()
    animationRef.current = animate(progress, 1, {
      duration: HOLD_DURATION_MS / 1000,
      ease: 'linear',
      onComplete: () => {
        triggerDelete()
      }
    })
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (isDeleting) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (progress.get() >= 1) return

    animationRef.current?.stop()
    animate(progress, 0, { duration: 0.18, ease: 'easeOut' })
  }

  return (
    <div className='space-y-2'>
      <motion.button
        type='button'
        disabled={isDeleting}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        aria-label='Press and hold to delete this room'
        data-umami-event='Delete Room (long press)'
        className={cn(
          'relative w-fit select-none touch-none overflow-hidden',
          'inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium',
          'bg-destructive text-destructive-foreground shadow-sm',
          'disabled:opacity-60 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        <motion.span
          aria-hidden
          className='absolute inset-y-0 left-0 w-full origin-left bg-destructive-foreground/25'
          style={{ scaleX: prefersReducedMotion ? 0 : progress }}
        />
        <span className='relative inline-flex items-center gap-2'>
          {isDeleting ? 'Deleting room...' : 'Hold to delete'}
        </span>
      </motion.button>

      {error && <p className='text-destructive text-sm'>{error}</p>}
    </div>
  )
}
