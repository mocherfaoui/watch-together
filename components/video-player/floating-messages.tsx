'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRoomMessages } from '../room-messages-provider'

type FloatingMessage = {
  id: string
  sender: string
  content: string
}

const MESSAGE_LIFETIME_MS = 5000
const MAX_VISIBLE = 5

export default function FloatingMessages({
  currentUserId
}: {
  currentUserId: string
}) {
  const [visible, setVisible] = useState<FloatingMessage[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )
  const { subscribeToNewMessages } = useRoomMessages()

  useEffect(() => {
    const unsubscribe = subscribeToNewMessages((payload) => {
      if (!payload || payload.sender?.id === currentUserId) return

      const msg: FloatingMessage = {
        id: payload.id,
        sender: payload.sender?.name ?? '',
        content: payload.content ?? ''
      }

      setVisible((prev) => {
        const next = [...prev, msg]
        if (next.length > MAX_VISIBLE) {
          const dropped = next.slice(0, next.length - MAX_VISIBLE)
          dropped.forEach((d) => {
            const t = timersRef.current.get(d.id)
            if (t) {
              clearTimeout(t)
              timersRef.current.delete(d.id)
            }
          })
          return next.slice(next.length - MAX_VISIBLE)
        }
        return next
      })

      const timer = setTimeout(() => {
        setVisible((prev) => prev.filter((m) => m.id !== msg.id))
        timersRef.current.delete(msg.id)
      }, MESSAGE_LIFETIME_MS)
      timersRef.current.set(msg.id, timer)
    })

    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
      unsubscribe()
    }
  }, [subscribeToNewMessages, currentUserId])

  return (
    <div className='pointer-events-none absolute bottom-30 right-4.5 z-20 flex flex-col items-end gap-1 max-w-[60%]'>
      <AnimatePresence initial={false}>
        {visible.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className='text-sm text-right text-white wrap-anywhere [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]'
          >
            <span className='font-semibold mr-1'>{m.sender}:</span>
            <span>{m.content}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
