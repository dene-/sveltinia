import { createStore } from './internal/store-factory.js'
import { SVELTINIA_PROVISION_KEY } from './internal/constants.js'
import { clone } from './internal/reactivity.js'
import type {
  App,
  ComputedCell,
  DefineStoreOptions,
  Sveltinia,
  SveltiniaOptions,
  SetupCell,
  SetupStore,
  StateTree,
  Store,
} from './internal/types.js'

// Module-level active sveltinia is intentional: Sveltinia's ergonomic API lets stores
// resolve their root implicitly via `defineStore(id, ...)()` without passing
// the root every time. Only one sveltinia is active at a time per module instance.
let activeSveltinia: Sveltinia | undefined

export const setActiveSveltinia = (sveltinia?: Sveltinia): void => {
  activeSveltinia = sveltinia
}

export const getActiveSveltinia = (): Sveltinia | undefined => activeSveltinia

export function createSveltinia(options: SveltiniaOptions = {}): Sveltinia {
  const sveltinia: Sveltinia = {
    state: clone(options.state ?? {}),
    _stores: new Map(),
    _plugins: [],
    _options: options,
    use(plugin) {
      this._plugins.push(plugin)
      return this
    },
    install(app?: App) {
      setActiveSveltinia(this)
      app?.provide(SVELTINIA_PROVISION_KEY, this)
    },
    dispose() {
      this.forEachStore((store) => store.$dispose())
      this._stores.clear()
    },
    registerStore(id, store, state) {
      this.state[id] = state
      this._stores.set(id, store)
    },
    unregisterStore(id) {
      this._stores.delete(id)
    },
    getStore(id) {
      return this._stores.get(id)
    },
    option(name) {
      return this._options[name]
    },
    forEachStore(callback) {
      for (const store of this._stores.values()) callback(store)
    },
    pluginContext(store, options) {
      return { sveltinia: this, store, options }
    },
  }
  return sveltinia
}

export const state = <T>(value: T): SetupCell<T> => ({
  __sveltiniaCell: 'state',
  value,
})

export const computed = <T>(fn: () => T): ComputedCell<T> => ({
  __sveltiniaCell: 'computed',
  get value() {
    return fn()
  },
})

export function defineStore<S extends StateTree>(
  id: string,
  options: DefineStoreOptions<S>,
): (sveltinia?: Sveltinia) => Store<S>
export function defineStore(
  id: string,
  setup: SetupStore,
  options?: DefineStoreOptions | Record<string, unknown>,
): (sveltinia?: Sveltinia) => Store
export function defineStore(
  id: string,
  definition: DefineStoreOptions<StateTree> | SetupStore,
  options?: DefineStoreOptions | Record<string, unknown>,
): (sveltinia?: Sveltinia) => Store {
  return (sveltinia = activeSveltinia) => {
    if (!sveltinia)
      throw new Error(
        `No active Sveltinia for store "${id}". Pass a root or call setActiveSveltinia().`,
      )
    return createStore(id, sveltinia, definition, options)
  }
}
