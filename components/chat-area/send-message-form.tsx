import { startTransition, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { SendHorizontal } from 'lucide-react'
import { sendMessage } from '@/utils/server-actions'
import { generateUUID } from '@/utils'
import { Tables } from '@/types/supabase'

type ComponentProps = {
  roomProfile: Tables<'user'>
  roomId: string
  addOptimisticMessages: (action: object) => void
}

const initialState = {
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

  async function handleSendMessage() {
    const { messageContent } = formState

    const newMessage = {
      id: generateUUID(),
      content: messageContent,
      sender: roomProfile.id,
      room_id: roomId,
      sent_at: new Date().toISOString()
    }

    addOptimisticMessages({
      ...newMessage,
      sender: { name: roomProfile.name, id: roomProfile.id }
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
          await handleSendMessage()
        })
      }}
    >
      {formState?.error && (
        <p className='text-base md:text-sm text-destructive'>
          {formState?.error}
        </p>
      )}
      <div className='flex gap-2'>
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
        <Button size='icon' className='shrink-0'>
          <SendHorizontal />
          <span className='sr-only'>Send Message</span>
        </Button>
      </div>
    </form>
  )
}
