import type { StateTree } from './types.js'

export const isObject = (value: unknown): value is Record<PropertyKey, any> => value !== null && typeof value === 'object'
export const clone = <T>(value: T): T => {
  if (value === undefined) return value
  try { return structuredClone(value) } catch { return JSON.parse(JSON.stringify(value)) as T }
}
export function merge(target: any, patch: any): any {
  for (const key of Object.keys(patch)) {
    const source = patch[key]
    if (isObject(source) && !Array.isArray(source) && isObject(target[key]) && !Array.isArray(target[key])) merge(target[key], source)
    else target[key] = clone(source)
  }
  return target
}
export function pickPaths(state: StateTree, paths?: string[]): StateTree {
  if (!paths?.length) return clone(state)
  const out: StateTree = {}
  for (const path of paths) {
    const parts = path.split('.')
    let src: any = state; let dst: any = out
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      if (!(p in src)) break
      if (i === parts.length - 1) dst[p] = clone(src[p])
      else { dst[p] ||= {}; dst = dst[p]; src = src[p] }
    }
  }
  return out
}
export function makeObservable<T extends StateTree>(value: T, notify: (path: string, oldValue: unknown, newValue: unknown) => void, base = ''): T {
  if (!isObject(value)) return value
  const mutable: any = value
  for (const key of Object.keys(mutable)) mutable[key] = makeObservable(mutable[key], notify, base ? `${base}.${key}` : key)
  return new Proxy(value, {
    set(target, prop, next, receiver) {
      const path = base ? `${base}.${String(prop)}` : String(prop)
      const old = Reflect.get(target, prop, receiver)
      const wrapped = makeObservable(next, notify, path)
      const ok = Reflect.set(target, prop, wrapped, receiver)
      if (ok && !Object.is(old, next)) notify(path, old, next)
      return ok
    },
    deleteProperty(target, prop) {
      const path = base ? `${base}.${String(prop)}` : String(prop)
      const old = (target as any)[prop]
      const ok = Reflect.deleteProperty(target, prop)
      if (ok) notify(path, old, undefined)
      return ok
    }
  })
}
