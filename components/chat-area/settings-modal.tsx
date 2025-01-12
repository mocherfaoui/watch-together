import { useActionState, useState } from 'react'
import { Button } from '../ui/button'
import { Loader2, Settings } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog'
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

type FormState = {
  message: string
  payload: string
}

const SettingsModal = ({ roomProfile }: { roomProfile: Tables<'user'> }) => {
  const { name: userName, is_host: isHost } = roomProfile ?? {}
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [
    updateUserNameFormState,
    updateUserNameFormAction,
    isUpdatingUserName
  ] = useActionState(handleUpdateUserName, {
    message: '',
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
      >
        <Settings />
        <span className='sr-only'>Open Room Settings</span>
      </Button>
      <Sheet open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <SheetContent>
          <SheetHeader>
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
                {updateUserNameFormState?.message && (
                  <p className='text-base md:text-sm text-destructive'>
                    {updateUserNameFormState?.message}
                  </p>
                )}
                <div className='flex items-center gap-2'>
                  <Input
                    type='text'
                    required={true}
                    defaultValue={updateUserNameFormState.payload}
                    placeholder='New username'
                    name='new_username'
                    id='new_username'
                  />
                  <Button disabled={isUpdatingUserName}>
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
                >
                  Delete this room
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog open={alertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              room with all sent messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SettingsModal
