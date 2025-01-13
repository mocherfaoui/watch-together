import { startTransition, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { SendHorizontal } from 'lucide-react'
import { sendMessage, sendNewUserMessage } from '@/utils/server-actions'
import { generateUUID } from '@/utils'
import { Tables } from '@/types/supabase'

type ComponentProps = {
  roomProfile: Tables<'user'> | null
  roomId: string
  addOptimisticMessages: (action: object) => void
}

const initialState = {
  userName: '',
  messageContent: '',
  error: ''
}

export default function SendMessageForm({
  roomProfile,
  roomId,
  addOptimisticMessages
}: ComponentProps) {
  const [formState, setFormState] = useState(initialState)

  const formRef = useRef<HTMLFormElement>(null)

  async function newSendMessage() {
    const { messageContent, userName } = formState

    if (!roomProfile) {
      const newMessage = {
        content: messageContent,
        room_id: roomId,
        sent_at: new Date().toISOString()
      }

      addOptimisticMessages({
        ...newMessage,
        id: generateUUID(),
        sender: { name: userName }
      })

      const submittedForm = await sendNewUserMessage(newMessage, userName)
      if (submittedForm?.error) {
        setFormState({
          userName,
          messageContent,
          error: submittedForm.error
        })
      }
      return
    }

    const newMessage = {
      content: formState.messageContent,
      sender: roomProfile.id,
      room_id: roomId,
      sent_at: new Date().toISOString()
    }

    addOptimisticMessages({
      ...newMessage,
      id: generateUUID(),
      sender: { name: roomProfile.name }
    })

    const submittedForm = await sendMessage(newMessage, roomProfile)

    if (submittedForm?.error) {
      setFormState({
        ...formState,
        messageContent: newMessage.content,
        error: submittedForm.error
      })
    }
  }

  return (
    <form
      ref={formRef}
      className={cn({
        'p-3 flex flex-col gap-2 border-t border-gray-200': true,
        'pt-2': formState?.error
      })}
      onSubmit={(event) => {
        event.preventDefault()
        setFormState(initialState)
        startTransition(async () => {
          await newSendMessage()
        })
      }}
    >
      {formState?.error && (
        <p className='text-base md:text-sm text-destructive'>
          {formState?.error}
        </p>
      )}
      <div className='flex gap-2'>
        {!roomProfile && (
          <Input
            type='text'
            name='username'
            placeholder='your username'
            required={true}
            value={formState.userName}
            onChange={(event) =>
              setFormState({ ...formState, userName: event.target.value })
            }
          />
        )}
        <Input
          type='text'
          name='message_content'
          placeholder='your message'
          autoComplete='off'
          required={true}
          value={formState.messageContent}
          onChange={(event) =>
            setFormState({ ...formState, messageContent: event.target.value })
          }
        />
        <Button size='icon' className='flex-shrink-0'>
          <SendHorizontal />
          <span className='sr-only'>Send Message</span>
        </Button>
      </div>
    </form>
  )
}
