'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import ChangeVideoForm from './change-video-form'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { useIsFullscreen } from '@/hooks/useIsFullscreen'

type DesktopScrollRevealProps = {
  children: ReactNode
  defaultVideoUrl: string
  onUrlSubmit: (videoUrl: string) => void
  onFileReady: (data: {
    magnetUri: string
    localFile: { url: string; type: string }
  }) => void
}

export default function DesktopScrollReveal({
  children,
  defaultVideoUrl,
  onUrlSubmit,
  onFileReady
}: DesktopScrollRevealProps) {
  const isWideViewport = useMediaMatch('(min-width: 768px)')
  const isFullscreen = useIsFullscreen()
  const active = isWideViewport && !isFullscreen

  const formSectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const blurBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'blur(0px) brightness(1)',
      'blur(4px) brightness(0.8)',
      'blur(10px) brightness(0.4)'
    ]
  )

  const filter = useTransform(() =>
    active ? blurBackground.get() : 'blur(0px) brightness(1)'
  )

  const hideScrollIndicator = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 0.5, 1]
  )

  useLayoutEffect(() => {
    if (!active) return

    const scrollToForm = () => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (document.readyState === 'complete') {
      scrollToForm()
    } else {
      window.addEventListener('load', scrollToForm)
      return () => window.removeEventListener('load', scrollToForm)
    }
  }, [active])

  return (
    <>
      <motion.div
        className='h-full fixed bottom-0 flex flex-col md:flex-row w-full'
        style={{ filter }}
      >
        {children}
      </motion.div>
      {active && (
        <>
          <motion.div
            style={{ opacity: hideScrollIndicator }}
            className='fixed right-4 top-1/2 z-1 flex flex-col justify-end items-center gap-2 pointer-events-none'
          >
            <div className='flex flex-col items-center gap-1 relative text-foreground border h-12 w-6 rounded-xl before:content-[""] before:w-2 before:h-2 before:bg-gray-100 before:rounded-full before:top-3/4 before:-translate-y-1/2 before:absolute before:animate-fade-up'></div>
            <div className='text-xs flex flex-col items-center text-white'>
              <span>Scroll</span>
              <span>up</span>
            </div>
          </motion.div>
          <div
            ref={formSectionRef}
            className='h-screen flex flex-col mt-[100vh] relative z-2 items-center justify-center p-4'
          >
            <ChangeVideoForm
              defaultVideoUrl={defaultVideoUrl}
              onUrlSubmit={onUrlSubmit}
              onFileReady={onFileReady}
            />
          </div>
        </>
      )}
    </>
  )
}
