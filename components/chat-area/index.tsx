'use client'
import { useEffect, useRef, startTransition, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Tables } from '@/types/supabase'
import { revalidatePathOnServer } from '@/utils/server-actions'

import MessageTimestamp from './message-timestamp'
import { ModifiedMessageType, PLAYBACK_MESSAGE } from '@/types'
import SettingsModal from './settings-modal'
import SendMessageForm from './send-message-form'
import OnlineUsers from './online-users'
import { ButtonGroup } from '../ui/button-group'
import { useRoomMessages } from '../room-messages-provider'

export default function ChatArea({
  roomProfile,
  messages,
  roomId,
  addOptimisticMessages,
  headerActions
}: {
  roomProfile: Tables<'user'>
  messages: ModifiedMessageType
  roomId: string
  addOptimisticMessages: (action: object) => void
  headerActions?: ReactNode
}) {
  const messagesRef = useRef<HTMLDivElement>(null)

  const { subscribeToNewMessages } = useRoomMessages()

  useEffect(() => {
    return subscribeToNewMessages(async (payload) => {
      if (roomProfile.id === payload?.sender?.id) return

      startTransition(() => {
        addOptimisticMessages(payload)
      })
      await revalidatePathOnServer(`/room/${roomId}`)
    })
    // eslint-disable-next-line
  }, [subscribeToNewMessages, roomProfile.id, roomId])

  return (
    <>
      <div className='h-full w-full md:w-[40vw] lg:w-[25vw] border-t md:border-l md:border-t-0 border-hairline'>
        <div className='flex flex-col h-full'>
          <div className='aqua-chrome flex items-center justify-between border-b border-hairline px-3'>
            {headerActions}
            <ButtonGroup className='h-11 w-full flex items-center justify-end'>
              <OnlineUsers
                roomId={roomId}
                userId={roomProfile.id}
                userName={roomProfile.name}
              />
              <SettingsModal roomProfile={roomProfile} />
            </ButtonGroup>
          </div>

          <div className='aqua-well relative flex flex-1 bg-background'>
            <div
              ref={messagesRef}
              className='absolute top-0 left-0 h-full w-full flex flex-col-reverse overflow-y-auto px-3'
            >
              <div className='flex flex-col gap-1 py-3'>
                {messages?.map((message) => {
                  const isPlaybackMessage =
                    message.content === PLAYBACK_MESSAGE.played ||
                    message.content === PLAYBACK_MESSAGE.paused

                  return (
                    <div
                      key={message.id}
                      className='text-sm text-pretty h-full inline-flex items-baseline'
                    >
                      <MessageTimestamp timestamp={message.sent_at} />
                      <div className='h-full inline-block'>
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
                          :
                        </span>
                        <span
                          className={cn({
                            'text-muted-foreground italic': isPlaybackMessage
                          })}
                        >
                          {message.content}
                        </span>
                      </div>
                    </div>
                  )
                })}
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
