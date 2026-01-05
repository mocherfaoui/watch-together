import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

type UserPresence = {
  id: string
  name: string
  online_at: string
}

export default function OnlineUsers({
  roomId,
  userId,
  userName
}: {
  roomId: string
  userId: string
  userName: string
}) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])

  useEffect(() => {
    const supabase = createClient()
    const room = supabase.channel(`room:${roomId}:presence`, {
      config: {
        presence: {
          key: userId
        }
      }
    })
    const userStatus = {
      online_at: new Date().toISOString(),
      id: userId,
      name: userName || 'Anonymous'
    }

    const channel = room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState()
        const users = []
        for (const user in newState) {
          users.push(newState[user][0] as unknown as UserPresence)
        }

        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return
        }
        await room.track(userStatus)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [roomId, userId, userName])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='text-sm'>
          {onlineUsers.length} online
        </Button>
      </PopoverTrigger>
      <PopoverContent className='min-w-20 w-40' align='end'>
        <div className='space-y-2'>
          {onlineUsers.map((user) => (
            <p key={user.id} className='w-fit text-sm'>
              {user.name} {user.id === userId ? '(you)' : ''}
            </p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
