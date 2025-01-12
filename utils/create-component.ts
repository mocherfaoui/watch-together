import React from 'react'
import type { EventName } from '@lit/react'
import { createComponent as create } from '@lit/react'

type EventNames = Record<string, EventName | string>
const rename = (str: string): string =>
  str[0].toUpperCase() +
  str.slice(1).replace(/(-\w)/g, (s) => s[1].toUpperCase())
export const createComponent = <
  I extends HTMLElement,
  // eslint-disable-next-line
  E extends EventNames = {}
>(
  elementClass: new () => I,
  tagName: string,
  events: E | undefined = undefined
) => {
  const output = Object.assign(
    Object.assign(
      create<I, E>({
        tagName,
        elementClass,
        react: React,
        events
      }),
      {
        displayName: rename(tagName)
      }
    ),
    {
      displayName: rename(tagName)
    }
  )

  return output
}

export default createComponent
