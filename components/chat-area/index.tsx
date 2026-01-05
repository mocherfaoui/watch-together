'use client'
import {
  useState,
  useEffect,
  useRef,
  useOptimistic,
  startTransition
} from 'react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import { Tables } from '@/types/supabase'
import { revalidatePathOnServer } from '@/utils/server-actions'

import MessageTimestamp from './message-timestamp'
import { ModifiedMessageType } from '@/types'
import SettingsModal from './settings-modal'
import SendMessageForm from './send-message-form'
import OnlineUsers from './online-users'
import { ButtonGroup } from '../ui/button-group'

export default function ChatArea({
  roomProfile,
  messages,
  roomId
}: {
  roomProfile: Tables<'user'>
  messages: ModifiedMessageType
  roomId: string
}) {
  const [isScrollable, setIsScrollable] = useState(false)
  const [optimisticMessages, addOptimisticMessages] = useOptimistic<
    ModifiedMessageType,
    object
  >(
    messages,
    (state, newState) => [...(state ?? []), newState] as ModifiedMessageType
  )
  const messagesRef = useRef<HTMLDivElement>(null)
  const messagesBottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScrollable = () => {
      if (messagesRef.current) {
        setIsScrollable(
          messagesRef.current.scrollHeight > messagesRef.current.clientHeight
        )
      }
    }

    checkScrollable()
    window.addEventListener('resize', checkScrollable)
    return () => window.removeEventListener('resize', checkScrollable)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}:messages`)
      .on('broadcast', { event: 'new-message' }, async ({ payload }) => {
        if (roomProfile.id === payload?.sender?.id) return

        startTransition(() => {
          addOptimisticMessages(payload)
        })
        await revalidatePathOnServer(`/room/${roomId}`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [roomProfile])

  return (
    <>
      <div className='bg-white h-full w-full md:w-[40vw] lg:w-[25vw] border-t md:border-l md:border-t-0 border-gray-200'>
        <div className='flex flex-col h-full'>
          <ButtonGroup className='h-[61px] w-full flex px-3 items-center justify-end'>
            <OnlineUsers
              roomId={roomId}
              userId={roomProfile.id}
              userName={roomProfile.name}
            />
            {roomProfile.name && <SettingsModal roomProfile={roomProfile} />}
          </ButtonGroup>
          <div className='relative flex flex-1'>
            <div
              ref={messagesRef}
              className={cn({
                'absolute top-0 left-0 h-full w-full flex flex-col-reverse overflow-y-auto px-3':
                  true,
                'pr-0': isScrollable
              })}
            >
              <div className='flex flex-col gap-1 pt-1'>
                {optimisticMessages?.map((message) => (
                  <div key={message.id} className='text-sm'>
                    <span className='inline-flex items-baseline mr-1'>
                      <span
                        className={cn({
                          'font-semibold': true,
                          'underline decoration-dashed decoration-1 underline-offset-2':
                            roomProfile.id === message.sender?.id
                        })}
                      >
                        {message.sender?.name}
                      </span>
                      <MessageTimestamp timestamp={message.sent_at} />:
                    </span>
                    <span>{message.content}</span>
                  </div>
                ))}
                <div ref={messagesBottom}></div>
              </div>
            </div>
          </div>
          <SendMessageForm
            roomProfile={roomProfile}
            roomId={roomId}
            addOptimisticMessages={addOptimisticMessages}
          />
        </div>
      </div>
    </>
  )
}
