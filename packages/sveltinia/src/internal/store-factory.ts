import { instrumentAction } from './action.js'
import { clone, makeObservable, merge } from './reactivity.js'
import { defaultClock, noopDebugEmitter, type Clock } from './util.js'
import type {
  ActionSubscription,
  ComputedCell,
  DefineStoreOptions,
  Mutation,
  Sveltinia,
  SetupCell,
  SetupStore,
  StateTree,
  Store,
  Subscription,
} from './types.js'

type ActionFn = (...args: unknown[]) => unknown
type GetterFn = (this: Store, state: StateTree) => unknown

type StoreRecord = Record<PropertyKey, unknown> & {
  $id: string
  $state: StateTree
  $patch(patch: Partial<StateTree> | ((state: StateTree) => void)): void
  $subscribe(cb: Subscription): () => void
  $onAction(cb: ActionSubscription): () => void
  $dispose(): void
  $reset(): void
  _emitDebug: (event: import('./types.js').DebugEvent) => void
}

const isStateCell = (value: unknown): value is SetupCell<unknown> =>
  (value as SetupCell<unknown>)?.__sveltiniaCell === 'state'

const isComputedCell = (value: unknown): value is ComputedCell<unknown> =>
  (value as ComputedCell<unknown>)?.__sveltiniaCell === 'computed'

interface StoreShell {
  store: StoreRecord
  reactiveState: StateTree
  bindAction: (name: string, action: ActionFn) => void
  bindGetter: (name: string, getter: GetterFn) => void
  bindStateCell: (name: string, cell: SetupCell<unknown>) => void
  bindComputedCell: (name: string, cell: ComputedCell<unknown>) => void
  bindPlainStateValue: (name: string, value: unknown) => void
}

function defineStateAccessor(
  store: StoreRecord,
  key: string,
  reactiveState: StateTree,
): void {
  Object.defineProperty(store, key, {
    enumerable: true,
    get: () => reactiveState[key],
    set: (value: unknown) => {
      reactiveState[key] = value
    },
  })
}

function defineGetter(
  store: StoreRecord,
  name: string,
  getter: GetterFn,
  reactiveState: StateTree,
): void {
  Object.defineProperty(store, name, {
    enumerable: true,
    get: () => getter.call(store as unknown as Store, reactiveState),
  })
}

function createStoreShell<S extends StateTree>(
  id: string,
  sveltinia: Sveltinia,
  initialState: StateTree,
  clock: Clock,
): StoreShell {
  let pendingBatch: Mutation | undefined
  let disposed = false
  const subscribers = new Set<Subscription>()
  const actionSubscribers = new Set<ActionSubscription>()

  const emitMutation = (mutation: Mutation): void => {
    for (const callback of subscribers) callback(mutation, reactiveState)
    sveltinia.state[id] = reactiveState
    store._emitDebug({ kind: 'mutation', storeId: id, mutation })
  }

  const notify = (path: string, oldValue: unknown, newValue: unknown): void => {
    if (disposed) return
    const event = { path, oldValue: clone(oldValue), newValue: clone(newValue) }
    if (pendingBatch) {
      pendingBatch.events!.push(event)
      return
    }
    emitMutation({ type: 'direct', storeId: id, events: [event] })
  }

  const reactiveState = makeObservable(clone(initialState), notify)
  const store = { $id: id, _emitDebug: noopDebugEmitter } as StoreRecord

  Object.defineProperty(store, '$state', {
    get: () => reactiveState,
    set: (value: S) => store.$patch(value as Partial<StateTree>),
  })

  Object.keys(reactiveState).forEach((key) => defineStateAccessor(store, key, reactiveState))

  store.$patch = (patch: Partial<StateTree> | ((state: StateTree) => void)): void => {
    const type =
      typeof patch === 'function' ? 'patch function' : 'patch object'
    pendingBatch = {
      type,
      storeId: id,
      payload: typeof patch === 'function' ? undefined : clone(patch),
      events: [],
    }
    try {
      if (typeof patch === 'function') patch(reactiveState)
      else merge(reactiveState, patch)
    } finally {
      const mutation = pendingBatch
      pendingBatch = undefined
      if (mutation) emitMutation(mutation)
    }
  }

  store.$subscribe = (callback: Subscription): (() => void) => {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  }

  store.$onAction = (callback: ActionSubscription): (() => void) => {
    actionSubscribers.add(callback)
    return () => actionSubscribers.delete(callback)
  }

  store.$dispose = (): void => {
    disposed = true
    subscribers.clear()
    actionSubscribers.clear()
    sveltinia.unregisterStore(id)
    store._emitDebug({ kind: 'lifecycle', storeId: id, name: 'dispose' })
  }

  const bindAction = (name: string, action: ActionFn): void => {
    store[name] = instrumentAction(name, action, store, id, actionSubscribers, clock)
  }

  const bindGetter = (name: string, getter: GetterFn): void => {
    defineGetter(store, name, getter, reactiveState)
  }

  const bindStateCell = (name: string, cell: SetupCell<unknown>): void => {
    reactiveState[name] = makeObservable(clone(cell.value) as StateTree, notify, name)
    // Wire the user's cell `.value` to the reactive state so `cell.value++` inside
    // a setup store reads from and writes to the tracked proxy. This in-place
    // redirect is intentional: the cell is the user-facing handle, the proxy is
    // the source of truth.
    Object.defineProperty(cell, 'value', {
      configurable: true,
      get: () => reactiveState[name],
      set: (value: unknown) => {
        reactiveState[name] = value
      },
    })
    defineStateAccessor(store, name, reactiveState)
  }

  const bindComputedCell = (name: string, cell: ComputedCell<unknown>): void => {
    Object.defineProperty(store, name, {
      enumerable: true,
      get: () => cell.value,
    })
  }

  const bindPlainStateValue = (name: string, value: unknown): void => {
    reactiveState[name] = makeObservable(clone(value) as StateTree, notify, name)
    defineStateAccessor(store, name, reactiveState)
  }

  return {
    store,
    reactiveState,
    bindAction,
    bindGetter,
    bindStateCell,
    bindComputedCell,
    bindPlainStateValue,
  }
}

function applyPlugins(
  sveltinia: Sveltinia,
  store: Store,
  options: DefineStoreOptions | Record<string, unknown>,
): void {
  for (const plugin of sveltinia._plugins)
    Object.assign(store, plugin(sveltinia.pluginContext(store, options)) ?? {})
}

export function createStore<S extends StateTree>(
  id: string,
  sveltinia: Sveltinia,
  definition: DefineStoreOptions<S> | SetupStore,
  setupOptions: DefineStoreOptions | Record<string, unknown> = {},
  clock: Clock = defaultClock,
): Store<S> {
  const existing = sveltinia.getStore(id)
  if (existing) return existing as Store<S>

  const isSetupStore = typeof definition === 'function'
  const options = isSetupStore ? setupOptions : (definition as DefineStoreOptions)
  const initialState = isSetupStore ? {} : (sveltinia.state[id] ?? definition.state())

  const shell = createStoreShell<S>(id, sveltinia, initialState, clock)
  if (isSetupStore) {
    const setupResult = definition()
    for (const [name, value] of Object.entries(setupResult)) {
      if (isStateCell(value)) shell.bindStateCell(name, value)
      else if (isComputedCell(value)) shell.bindComputedCell(name, value)
      else if (typeof value === 'function') shell.bindAction(name, value as ActionFn)
      else shell.bindPlainStateValue(name, value)
    }
    shell.store.$reset = (): void => {
      throw new Error(`Setup store "${id}" must expose its own reset action.`)
    }
  } else {
    for (const [name, getter] of Object.entries(definition.getters ?? {}))
      shell.bindGetter(name, getter as GetterFn)
    for (const [name, action] of Object.entries(definition.actions ?? {}))
      shell.bindAction(name, action as ActionFn)
    shell.store.$reset = (): void => shell.store.$patch(clone(definition.state()))
  }

  sveltinia.registerStore(id, shell.store as unknown as Store, shell.reactiveState)
  applyPlugins(sveltinia, shell.store as unknown as Store, options)

  return shell.store as unknown as Store<S>
}
