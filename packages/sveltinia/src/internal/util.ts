import type { DebugEvent } from './types.js'

export type Clock = () => number

export const defaultClock: Clock = () => performance.now()

export type DebugEmitter = (event: DebugEvent) => void

export const noopDebugEmitter: DebugEmitter = () => {}

export function flagToObject<T extends { enabled?: boolean }>(
  value: boolean | T | undefined,
): T | undefined {
  if (value === true) return { enabled: true } as T
  if (value === false) return undefined
  return value
}
