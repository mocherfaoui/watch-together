import { useActionState, useState } from 'react'
import { Button } from '../ui/button'
import { Loader2, Settings } from 'lucide-react'
import { Input } from '../ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '../ui/sheet'
import { Label } from '../ui/label'
import { Tables } from '@/types/supabase'
import { updateUserName } from '@/utils/server-actions'
import DeleteRoomAlert from './delete-room-alert'

type FormState = {
  error: string
  payload: string
}

const SettingsModal = ({ roomProfile }: { roomProfile: Tables<'user'> }) => {
  const { name: userName, is_host: isHost, room_id: roomId } = roomProfile
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
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
      <Sheet open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <SheetContent>
          <SheetHeader className='text-left'>
            <SheetTitle className='text-xl'>Room Settings</SheetTitle>
            <SheetDescription>
              Update your username and manage your room settings.
            </SheetDescription>
          </SheetHeader>
          <div className='pt-6 space-y-8'>
            <div className='flex flex-col'>
              <h3 className='font-semibold text-lg border-b pb-1 mb-4'>
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
                <h3 className='font-semibold text-lg text-destructive border-b pb-1 mb-4'>
                  Delete Room
                </h3>
                <p className='mb-2 text-sm'>
                  Once you delete this room, there is no going back. Please be
                  certain.
                </p>
                <Button
                  variant='destructive'
                  className='w-fit'
                  onClick={() => setAlertDialogOpen(true)}
                  data-umami-event='Open Delete Room Dialog button'
                >
                  Delete this room
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <DeleteRoomAlert
        alertDialogOpen={alertDialogOpen}
        setAlertDialogOpen={setAlertDialogOpen}
        roomId={roomId}
      />
    </>
  )
}

export default SettingsModal
