import { useActionState, useState } from 'react'
import { Button } from '../ui/button'
import { Loader2, Settings } from 'lucide-react'
import { Input } from '../ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer'
import { Label } from '../ui/label'
import { Tables } from '@/types/supabase'
import { updateUserName } from '@/utils/server-actions'
import DeleteRoomButton from './delete-room-button'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { cn } from '@/lib/utils'

type FormState = {
  error: string
  payload: string
}

const SettingsModal = ({ roomProfile }: { roomProfile: Tables<'user'> }) => {
  const { name: userName, is_host: isHost, room_id: roomId } = roomProfile
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isDesktop = useMediaMatch('(min-width: 768px)')
  const [
    updateUserNameFormState,
    updateUserNameFormAction,
    isUpdatingUserName
  ] = useActionState(handleUpdateUserName, {
    error: '',
    payload: userName as string
  })

  async function handleUpdateUserName(
    _formState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const newUserName = formData.get('new_username') as string

    return await updateUserName(newUserName, roomProfile)
  }

  return (
    <>
      <Button
        size='icon'
        variant='outline'
        onClick={() => setIsModalOpen(true)}
        data-umami-event='Open Room Settings button'
      >
        <Settings />
        <span className='sr-only'>Open Room Settings</span>
      </Button>
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction={isDesktop ? 'right' : 'bottom'}
      >
        <DrawerContent
          className={cn(
            isDesktop
              ? 'h-full md:w-[40vw]! md:max-w-none! lg:w-[25vw]!'
              : 'max-h-[85svh] pb-[max(1rem,env(safe-area-inset-bottom))]'
          )}
        >
          <DrawerHeader>
            <DrawerTitle className='text-lg'>Room Settings</DrawerTitle>
          </DrawerHeader>
          <div className='overflow-y-auto px-4 pb-4 space-y-8'>
            <div className='flex flex-col'>
              <h3 className='font-semibold border-b pb-1 mb-4'>
                Change username
              </h3>
              <form
                className='flex flex-col gap-2'
                action={updateUserNameFormAction}
              >
                <Label htmlFor='new_username'>Current Username</Label>
                {updateUserNameFormState?.error && (
                  <p className='text-base md:text-sm text-destructive'>
                    {updateUserNameFormState?.error}
                  </p>
                )}
                <div className='flex items-center gap-2'>
                  <Input
                    type='text'
                    required={true}
                    defaultValue={updateUserNameFormState.payload || userName}
                    placeholder='New username'
                    name='new_username'
                    id='new_username'
                  />
                  <Button
                    disabled={isUpdatingUserName}
                    data-umami-event='Update Username button'
                  >
                    {isUpdatingUserName && <Loader2 className='animate-spin' />}
                    Save
                  </Button>
                </div>
              </form>
            </div>
            {isHost && (
              <div className='flex flex-col'>
                <h3 className='font-semibold text-destructive border-b pb-1 mb-4'>
                  Delete Room
                </h3>
                <p className='mb-3 text-sm text-pretty'>
                  Once you delete this room, there is no going back. Please be
                  certain.
                </p>
                <DeleteRoomButton roomId={roomId} />
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SettingsModal
