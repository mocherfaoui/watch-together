import RelativeTime from '../relative-time'

export default function MessageTimestamp({
  timestamp
}: {
  timestamp: string | null
}) {
  return (
    <span className='h-full inline-flex justify-start text-xs text-muted-foreground tabular-nums'>
      (
      <RelativeTime datetime={timestamp ?? undefined} />
      )
    </span>
  )
}
