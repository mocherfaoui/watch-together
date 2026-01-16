import ErrorState from '@/components/error-state'

export default function Home() {
  // I don't like this approach of rendering an error state directly
  // but it's the only way to get the error state to work with the middleware
  return <ErrorState />
}
