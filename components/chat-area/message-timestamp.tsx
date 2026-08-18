import RelativeTime from '../relative-time'

export default function MessageTimestamp({
  timestamp
}: {
  timestamp: string | null
}) {
  return (
    <span className='h-full inline-flex justify-end text-xs text-muted-foreground tabular-nums mr-2 min-w-6'>
      <RelativeTime datetime={timestamp ?? undefined} />
    </span>
  )
}
