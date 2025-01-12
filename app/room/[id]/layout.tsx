export default function Layout({
  children,
  videoplayer,
  chatarea
}: {
  children: React.ReactNode
  videoplayer: React.ReactNode
  chatarea: React.ReactNode
}) {
  return (
    <div className='flex flex-col md:flex-row w-full h-screen'>
      {videoplayer}
      {chatarea}
      {children}
    </div>
  )
}
