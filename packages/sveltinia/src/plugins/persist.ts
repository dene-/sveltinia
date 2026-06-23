import { clone, merge } from '../internal/reactivity.js'
import {
  DEBUG_KIND,
  DEFAULT_PERSIST_VERSION,
  LEGACY_PERSIST_VERSION,
} from '../internal/constants.js'
import { flagToObject } from '../internal/util.js'
import type {
  PersistOptions,
  Sveltinia,
  SveltiniaPluginContext,
  Serializer,
  StateTree,
  StorageAdapter,
  Store,
} from '../internal/types.js'

declare module '../internal/types.js' {
  interface StoreExtensions extends PersistableStore {}
}

const JSON_SERIALIZER: Serializer = { serialize: JSON.stringify, deserialize: JSON.parse }

export const browserStorage = (
  kind: 'localStorage' | 'sessionStorage' = 'localStorage',
): StorageAdapter | undefined => {
  if (typeof window === 'undefined') return undefined
  return window[kind]
}

function resolvePersistConfig(
  value: boolean | PersistOptions | undefined,
  root: PersistOptions | undefined,
): PersistOptions | undefined {
  const local = flagToObject(value)
  if (!local && !root?.enabled) return undefined
  return { ...root, ...local, enabled: local?.enabled ?? root?.enabled ?? true }
}

function resolveStorage(config: PersistOptions): StorageAdapter | undefined {
  if (typeof config.storage === 'object') return config.storage
  return browserStorage(config.storage ?? 'localStorage')
}

function pickPaths(state: StateTree, paths?: string[]): StateTree {
  if (!paths?.length) return clone(state)
  const out: StateTree = {}
  for (const path of paths) {
    const segments = path.split('.')
    let source: StateTree = state
    let destination: StateTree = out
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!(segment in source)) break
      if (i === segments.length - 1) {
        destination[segment] = clone(source[segment])
      } else {
        destination[segment] ||= {}
        destination = destination[segment] as StateTree
        source = source[segment] as StateTree
      }
    }
  }
  return out
}

function installPersistence(store: Store, config: PersistOptions): void {
  const storage = resolveStorage(config)
  if (!storage) return

  const key = config.key ?? `sveltinia:${store.$id}`
  const serializer = config.serializer ?? JSON_SERIALIZER
  let restoring = false

  store.$restore = async (): Promise<void> => {
    config.beforeRestore?.({ store })
    const value = await storage.getItem(key)
    if (value) {
      const envelope = serializer.deserialize(value) as {
        state?: StateTree
        version?: number
      }
      let incoming: StateTree = envelope.state ?? (envelope as StateTree)
      if (config.version !== undefined && envelope.version !== config.version && config.migrate)
        incoming = await config.migrate(incoming, envelope.version ?? LEGACY_PERSIST_VERSION)
      restoring = true
      try {
        store.$patch((state: StateTree) => merge(state, incoming))
      } finally {
        restoring = false
      }
      store._emitDebug?.({
        kind: DEBUG_KIND.PERSISTENCE,
        storeId: store.$id,
        name: 'restore',
        detail: key,
      })
    }
    config.afterRestore?.({ store })
  }

  store.$persist = async (): Promise<void> => {
    const state = pickPaths(store.$state, config.paths)
    await storage.setItem(
      key,
      serializer.serialize({ version: config.version ?? DEFAULT_PERSIST_VERSION, state }),
    )
    store._emitDebug?.({
      kind: DEBUG_KIND.PERSISTENCE,
      storeId: store.$id,
      name: 'write',
      detail: key,
    })
  }

  store.$subscribe(() => {
    if (!restoring) void store.$persist()
  })

  if (config.lazy === false) {
    const restoredPromise = store.$restore()
    store.$restored = restoredPromise
    restoredPromise.catch((error: unknown) => {
      console.error(`[sveltinia] persistence restore failed for "${store.$id}"`, error)
    })
  } else {
    store.$restored = Promise.resolve()
  }
}

export function createPersistedState(defaults: PersistOptions = {}) {
  return ({ sveltinia, store, options }: SveltiniaPluginContext) => {
    const rootConfig = sveltinia.option('persist')
    const config = resolvePersistConfig(
      (options as { persist?: boolean | PersistOptions }).persist,
      rootConfig ? { ...defaults, ...rootConfig } : defaults,
    )
    if (!config?.enabled) return
    installPersistence(store, config)
  }
}
