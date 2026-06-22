import { merge, pickPaths } from './reactivity.js'
import type { PersistOptions, Pinia, StorageAdapter, Store } from './types.js'

export const browserStorage = (kind: 'localStorage' | 'sessionStorage' = 'localStorage'): StorageAdapter | undefined => {
  if (typeof window === 'undefined') return undefined
  return window[kind]
}
const normalize = (value: boolean | PersistOptions | undefined, root?: PersistOptions): PersistOptions | undefined => {
  if (value === false) return undefined
  if (value === true) return { ...root, enabled: true }
  if (!value && !root?.enabled) return undefined
  return { ...root, ...value, enabled: value?.enabled ?? root?.enabled ?? true }
}
export function createPersistedState(defaults: PersistOptions = {}) {
  return ({ pinia, store, options }: { pinia: Pinia; store: Store; options: any }) => {
    const config = normalize(options.persist, pinia._options.persist ? { ...defaults, ...pinia._options.persist } : defaults)
    if (!config?.enabled) return
    const storage = typeof config.storage === 'object' ? config.storage : browserStorage(config.storage ?? 'localStorage')
    if (!storage) return
    const key = config.key ?? `sveltinia:${store.$id}`
    const serializer = config.serializer ?? { serialize: JSON.stringify, deserialize: JSON.parse }
    let restoring = false
    store.$restore = async () => {
      config.beforeRestore?.({ store })
      const value = await storage.getItem(key)
      if (value) {
        const envelope = serializer.deserialize(value)
        let incoming = envelope.state ?? envelope
        if (config.version !== undefined && envelope.version !== config.version && config.migrate) incoming = await config.migrate(incoming, envelope.version ?? 0)
        restoring = true
        store.$patch((state: any) => merge(state, incoming))
        restoring = false
        store._emitDebug?.({ kind: 'persistence', storeId: store.$id, name: 'restore', detail: key })
      }
      config.afterRestore?.({ store })
    }
    store.$persist = async () => {
      const state = pickPaths(store.$state, config.paths)
      await storage.setItem(key, serializer.serialize({ version: config.version ?? 1, state }))
      store._emitDebug?.({ kind: 'persistence', storeId: store.$id, name: 'write', detail: key })
    }
    store.$subscribe(() => { if (!restoring) void store.$persist() })
    void store.$restore()
  }
}
