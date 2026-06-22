import { clone, makeObservable, merge } from './reactivity.js'
import type { ActionSubscription, DefineStoreOptions, Mutation, Pinia, PiniaOptions, SetupCell, SetupStore, Store, Subscription, StateTree, ComputedCell } from './types.js'

let activePinia: Pinia | undefined
export const setActivePinia = (pinia?: Pinia) => (activePinia = pinia)
export const getActivePinia = () => activePinia

export function createPinia(options: PiniaOptions = {}): Pinia {
  const pinia: Pinia = {
    state: clone(options.state ?? {}), _stores: new Map(), _plugins: [], _options: options,
    use(plugin) { this._plugins.push(plugin); return this },
    install(app) { setActivePinia(this); app?.provide?.('sveltinia', this) },
    dispose() { for (const store of this._stores.values()) store.$dispose(); this._stores.clear() }
  }
  return pinia
}

export const state = <T>(value: T): SetupCell<T> => ({ __sveltiniaCell: 'state', value })
export const computed = <T>(fn: () => T): ComputedCell<T> => ({ __sveltiniaCell: 'computed', get value() { return fn() } })
const isCell = (x: any) => x?.__sveltiniaCell === 'state'
const isComputed = (x: any) => x?.__sveltiniaCell === 'computed'

function createStore<S extends StateTree>(id: string, pinia: Pinia, definition: DefineStoreOptions<S> | SetupStore, setupOptions: any = {}): Store<S> {
  const existing = pinia._stores.get(id)
  if (existing) return existing as Store<S>
  const isOptions = typeof definition !== 'function'
  const options: any = isOptions ? definition : setupOptions
  let batch: Mutation | undefined
  let disposed = false
  const subscribers = new Set<Subscription>(); const actionSubscribers = new Set<ActionSubscription>()
  const notify = (path: string, oldValue: unknown, newValue: unknown) => {
    if (disposed) return
    const event = { path, oldValue: clone(oldValue), newValue: clone(newValue) }
    if (batch) { batch.events ||= []; batch.events.push(event); return }
    emit({ type: 'direct', storeId: id, events: [event] })
  }
  const initialRaw: any = isOptions ? (pinia.state[id] ?? definition.state()) : {}
  const raw = makeObservable(clone(initialRaw), notify)
  const store: any = { $id: id }
  Object.defineProperty(store, '$state', { get: () => raw, set: (value: S) => store.$patch(value) })
  Object.keys(raw).forEach((key) => Object.defineProperty(store, key, { enumerable: true, get: () => raw[key], set: (v) => raw[key] = v }))
  const emit = (mutation: Mutation) => { for (const cb of subscribers) cb(mutation, raw); pinia.state[id] = raw; store._emitDebug?.({ kind: 'mutation', storeId: id, mutation }) }
  store.$patch = (patch: any) => {
    const type = typeof patch === 'function' ? 'patch function' : 'patch object'
    batch = { type, storeId: id, payload: typeof patch === 'function' ? undefined : clone(patch), events: [] }
    try { typeof patch === 'function' ? patch(raw) : merge(raw, patch) } finally { const mutation = batch; batch = undefined; if (mutation) emit(mutation) }
  }
  store.$subscribe = (cb: Subscription) => { subscribers.add(cb); return () => subscribers.delete(cb) }
  store.$onAction = (cb: ActionSubscription) => { actionSubscribers.add(cb); return () => actionSubscribers.delete(cb) }
  store.$dispose = () => { disposed = true; subscribers.clear(); actionSubscribers.clear(); pinia._stores.delete(id); store._emitDebug?.({ kind: 'lifecycle', storeId: id, name: 'dispose' }) }
  store.$persist = async () => {}; store.$restore = async () => {}
  const bindAction = (name: string, action: Function) => {
    store[name] = (...args: any[]) => {
      const after: Array<(x: unknown) => void> = []; const onError: Array<(x: unknown) => void> = []; const start = performance.now()
      const ctx = { name, args, store, after: (cb: any) => after.push(cb), onError: (cb: any) => onError.push(cb) }
      actionSubscribers.forEach((cb) => cb(ctx))
      try { const result = action.apply(store, args); const finish = (value: any) => { after.forEach((cb) => cb(value)); store._emitDebug?.({ kind: 'action', storeId: id, name, duration: performance.now() - start }); return value }; return result instanceof Promise ? result.then(finish, (error: any) => { onError.forEach((cb) => cb(error)); store._emitDebug?.({ kind: 'action', storeId: id, name, duration: performance.now() - start, error }); throw error }) : finish(result) }
      catch (error) { onError.forEach((cb) => cb(error)); store._emitDebug?.({ kind: 'action', storeId: id, name, duration: performance.now() - start, error }); throw error }
    }
  }
  if (isOptions) {
    for (const [name, getter] of Object.entries(definition.getters ?? {})) Object.defineProperty(store, name, { enumerable: true, get: () => (getter as Function).call(store, raw) })
    for (const [name, action] of Object.entries(definition.actions ?? {})) bindAction(name, action)
    store.$reset = () => store.$patch(clone(definition.state()))
  } else {
    const exposed = definition()
    for (const [name, value] of Object.entries(exposed)) {
      if (isCell(value)) { raw[name] = makeObservable(clone(value.value), notify, name); Object.defineProperty(value, 'value', { configurable: true, get: () => raw[name], set: (v) => raw[name] = v }); Object.defineProperty(store, name, { enumerable: true, get: () => raw[name], set: (v) => raw[name] = v }) }
      else if (isComputed(value)) Object.defineProperty(store, name, { enumerable: true, get: () => value.value })
      else if (typeof value === 'function') bindAction(name, value)
      else { raw[name] = makeObservable(clone(value), notify, name); Object.defineProperty(store, name, { enumerable: true, get: () => raw[name], set: (v) => raw[name] = v }) }
    }
    store.$reset = () => { throw new Error(`Setup store "${id}" must expose its own reset action.`) }
  }
  pinia.state[id] = raw; pinia._stores.set(id, store)
  for (const plugin of pinia._plugins) Object.assign(store, plugin({ pinia, store, options }) ?? {})
  return store
}

export function defineStore<S extends StateTree>(id: string, options: DefineStoreOptions<S>): (pinia?: Pinia) => Store<S>
export function defineStore(id: string, setup: SetupStore, options?: any): (pinia?: Pinia) => Store
export function defineStore(id: string, definition: any, options?: any) { return (pinia = activePinia) => { if (!pinia) throw new Error(`No active Pinia for store "${id}". Pass a root or call setActivePinia().`); return createStore(id, pinia, definition, options) } }
