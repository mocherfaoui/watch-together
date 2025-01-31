export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col md:flex-row w-full h-full'>{children}</div>
  )
}
