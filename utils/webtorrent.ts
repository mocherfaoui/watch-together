'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Torrent, Instance as WebTorrentInstance } from 'webtorrent'

if (typeof window !== 'undefined') {
  ;(window as Window & { global?: typeof globalThis }).global = window
  // @ts-expect-error disable default trackers
  window.WEBTORRENT_ANNOUNCE = null
}

const TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.files.fm:7073/announce',
  'wss://tracker.btorrent.xyz'
]

let __client: WebTorrentInstance | null = null
let __torrent: Torrent | null = null
let serviceWorkerRegistration: ServiceWorkerRegistration

const isServiceWorkerActivated = async function () {
  return (await navigator.serviceWorker.ready)?.active?.state === 'activated'
}

const initWebtorrent = async function () {
  if (!navigator.serviceWorker || serviceWorkerRegistration) {
    return
  }

  const registration = await navigator.serviceWorker.register('/sw.min.js')

  while (true) {
    if (await isServiceWorkerActivated()) {
      serviceWorkerRegistration = registration
      return
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const promise = async function (obj: any, f: any, ...arg: any) {
  return new Promise((resolve, reject) => {
    f.apply(obj, [
      ...arg,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (first: any, second: any) => {
        if (second === undefined) {
          resolve(first)
        } else if (first) {
          reject(first)
        } else {
          resolve(second)
        }
      }
    ])
  })
}

const createWebTorrentClient = async function () {
  if (__client) {
    return __client
  }

  const [{ default: WebTorrent }] = await Promise.all([
    import('webtorrent'),
    initWebtorrent()
  ])

  const client = new WebTorrent({
    tracker: {
      announce: TRACKERS,
      rtcConfig: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ],
        iceCandidatePoolSize: 10
      }
    }
  })

  client.createServer({ controller: serviceWorkerRegistration })
  __client = client
  return __client
}

const sendFile = async function (file: File): Promise<string> {
  await createWebTorrentClient()

  if (__torrent) {
    await promise(__client, __client!.remove, __torrent.magnetURI)
    __torrent = null
  }

  return new Promise((resolve) => {
    const opts = {
      announceList: TRACKERS.map((tracker) => [tracker])
    }
    __client!.seed([file], opts, (torrent: Torrent) => {
      __torrent = torrent
      console.log('Seeding:', torrent.magnetURI)
      resolve(torrent.magnetURI)
    })
  })
}

const getStreamUrl = async function (magnetUri: string): Promise<string> {
  await initWebtorrent()
  await createWebTorrentClient()

  console.log('Getting stream URL for:', magnetUri)
  console.log('Current torrent:', __torrent?.magnetURI)
  if (__torrent?.magnetURI !== magnetUri) {
    if (__torrent) {
      console.log('Removing torrent:', __torrent.magnetURI)
      await promise(__client, __client!.remove, __torrent.magnetURI)
      __torrent = null
    }

    __torrent = await new Promise<Torrent>((resolve, reject) => {
      const torrent = __client!.add(magnetUri, { announce: TRACKERS })

      const timeout = setTimeout(() => {
        reject(new Error('Torrent metadata timeout - no peers found'))
      }, 60000)

      torrent.on('ready', () => {
        clearTimeout(timeout)
        console.log('Added torrent:', torrent.infoHash)
        resolve(torrent)
      })

      torrent.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  }

  while (!__torrent?.files.length) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (__torrent?.files[0]?.streamURL as string) ?? ''
}

export type TorrentState = {
  magnetUri: string | null
  progress: number
  downloadSpeed: number
  uploadSpeed: number
  numPeers: number
  ready: boolean
  error: string | null
}

export function useWebTorrentSeed() {
  const [torrentState, setTorrentState] = useState<TorrentState>({
    magnetUri: null,
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    numPeers: 0,
    ready: false,
    error: null
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const seedFile = useCallback(async (file: File): Promise<string> => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setTorrentState({
        magnetUri: null,
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        numPeers: 0,
        ready: false,
        error: null
      })

      const magnetUri = await sendFile(file)

      setTorrentState((prev) => ({
        ...prev,
        magnetUri,
        ready: true
      }))

      intervalRef.current = setInterval(() => {
        if (__torrent) {
          setTorrentState((prev) => ({
            ...prev,
            progress: __torrent?.progress ?? 0,
            downloadSpeed: __torrent?.downloadSpeed ?? 0,
            uploadSpeed: __torrent?.uploadSpeed ?? 0,
            numPeers: __torrent?.numPeers ?? 0
          }))
        }
      }, 1000)

      return magnetUri
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      setTorrentState((prev) => ({ ...prev, error }))
      throw err
    }
  }, [])

  const stopSeeding = useCallback(async () => {
    if (__torrent && __client) {
      await promise(__client, __client.remove, __torrent.magnetURI)
      __torrent = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTorrentState({
      magnetUri: null,
      progress: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      numPeers: 0,
      ready: false,
      error: null
    })
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    seedFile,
    stopSeeding,
    torrentState
  }
}

export function useWebTorrentDownload() {
  const [torrentState, setTorrentState] = useState<TorrentState>({
    magnetUri: null,
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    numPeers: 0,
    ready: false,
    error: null
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const downloadTorrent = useCallback(
    async (magnetUri: string): Promise<string | null> => {
      try {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        setTorrentState({
          magnetUri,
          progress: 0,
          downloadSpeed: 0,
          uploadSpeed: 0,
          numPeers: 0,
          ready: false,
          error: null
        })

        const url = await getStreamUrl(magnetUri)
        console.log('Got stream URL:', url)

        setTorrentState((prev) => ({ ...prev, ready: true }))

        intervalRef.current = setInterval(() => {
          if (__torrent) {
            setTorrentState((prev) => ({
              ...prev,
              progress: __torrent?.progress ?? 0,
              downloadSpeed: __torrent?.downloadSpeed ?? 0,
              uploadSpeed: __torrent?.uploadSpeed ?? 0,
              numPeers: __torrent?.numPeers ?? 0
            }))
          }
        }, 1000)

        return url
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setTorrentState((prev) => ({ ...prev, error }))
        throw err
      }
    },
    []
  )

  const stopDownloading = useCallback(async () => {
    if (__torrent && __client) {
      await promise(__client, __client.remove, __torrent.magnetURI)
      __torrent = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTorrentState({
      magnetUri: null,
      progress: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      numPeers: 0,
      ready: false,
      error: null
    })
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    downloadTorrent,
    stopDownloading,
    torrentState
  }
}

export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(0)} B/s`
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  } else {
    return `${(bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`
  }
}
