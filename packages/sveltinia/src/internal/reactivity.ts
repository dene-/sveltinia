import type { StateTree } from './types.js'

export const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  value !== null && typeof value === 'object'

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

export const isSafeKey = (key: PropertyKey): boolean =>
  typeof key !== 'string' || !UNSAFE_KEYS.has(key)

export const clone = <T>(value: T): T => {
  if (value === undefined) return value
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export function merge(target: StateTree, patch: StateTree): StateTree {
  for (const key of Object.keys(patch)) {
    if (!isSafeKey(key)) continue
    const source = patch[key]
    if (
      isObject(source) &&
      !Array.isArray(source) &&
      isObject(target[key]) &&
      !Array.isArray(target[key])
    )
      merge(target[key] as StateTree, source as StateTree)
    else target[key] = clone(source)
  }
  return target
}

export function makeObservable<T extends StateTree>(
  value: T,
  notify: (path: string, oldValue: unknown, newValue: unknown) => void,
  base = '',
): T {
  if (!isObject(value)) return value
  const target = value as Record<PropertyKey, unknown>
  for (const key of Object.keys(target)) {
    if (!isSafeKey(key)) {
      delete target[key]
      continue
    }
    target[key] = makeObservable(target[key] as StateTree, notify, base ? `${base}.${key}` : key)
  }
  return new Proxy(value, {
    set(target, prop, next, receiver) {
      if (!isSafeKey(prop)) return false
      const path = base ? `${base}.${String(prop)}` : String(prop)
      const old = Reflect.get(target, prop, receiver)
      const wrapped = makeObservable(next as StateTree, notify, path)
      const ok = Reflect.set(target, prop, wrapped, receiver)
      if (ok && !Object.is(old, next)) notify(path, old, next)
      return ok
    },
    deleteProperty(target, prop) {
      if (!isSafeKey(prop)) return false
      const path = base ? `${base}.${String(prop)}` : String(prop)
      const old = (target as Record<PropertyKey, unknown>)[prop]
      const ok = Reflect.deleteProperty(target, prop)
      if (ok) notify(path, old, undefined)
      return ok
    },
  }) as T
}
