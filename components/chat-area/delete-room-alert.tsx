import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState
} from 'react'
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '../ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { deleteRoom } from '@/utils/server-actions'

type ComponentProps = {
  alertDialogOpen: boolean
  setAlertDialogOpen: Dispatch<SetStateAction<boolean>>
  roomId: string
}

export default function DeleteRoomAlert({
  alertDialogOpen,
  setAlertDialogOpen,
  roomId
}: ComponentProps) {
  const deleteRoomWithId = deleteRoom.bind(null, roomId)
  const [deleteRoomState, deleteRoomAction, isDeletingRoom] = useActionState(
    deleteRoomWithId,
    {
      error: ''
    }
  )

  return (
    <AlertDialog open={alertDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this room
            with all sent messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='items-center'>
          {deleteRoomState?.error && (
            <p className='text-destructive text-sm'>{deleteRoomState?.error}</p>
          )}
          <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeletingRoom}
            onClick={() => startTransition(() => deleteRoomAction())}
          >
            {isDeletingRoom && <Loader2 className='animate-spin' />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
