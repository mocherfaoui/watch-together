import RelativeTime from '../relative-time'

export default function MessageTimestamp({
  timestamp
}: {
  timestamp: string | null
}) {
  return (
    <span className='text-xs text-muted-foreground tabular-nums'>
      <span>(</span>
      <RelativeTime datetime={timestamp ?? undefined}></RelativeTime>
      <span>)</span>
    </span>
  )
}
