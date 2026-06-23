export type StateTree = Record<string, unknown>

export type MutationType =
  | 'direct'
  | 'patch object'
  | 'patch function'
  | 'hydrate'
  | 'restore'

export interface Mutation {
  type: MutationType
  storeId: string
  events?: Array<{ path: string; oldValue: unknown; newValue: unknown }>
  payload?: unknown
}

export type Subscription = (mutation: Mutation, state: StateTree) => void

export interface ActionContext {
  name: string
  args: unknown[]
  store: Store
  after(cb: (value: unknown) => void): void
  onError(cb: (error: unknown) => void): void
}

export type ActionSubscription = (context: ActionContext) => void

export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem?(key: string): void | Promise<void>
}

export type Serializer = { serialize(v: unknown): string; deserialize(v: string): unknown }

export interface PersistOptions {
  enabled?: boolean
  key?: string
  storage?: 'localStorage' | 'sessionStorage' | StorageAdapter
  paths?: string[]
  version?: number
  migrate?: (state: StateTree, fromVersion: number) => StateTree | Promise<StateTree>
  serializer?: Serializer
  lazy?: boolean
  beforeRestore?: (ctx: { store: Store }) => void
  afterRestore?: (ctx: { store: Store }) => void
}

export interface DebugEvent {
  kind: 'mutation' | 'action' | 'persistence' | 'lifecycle'
  storeId: string
  name?: string
  mutation?: Mutation
  duration?: number
  error?: unknown
  detail?: unknown
}

export interface DebugOptions {
  enabled?: boolean
  logger?: (event: DebugEvent) => void
  redact?: string[]
}

export interface SveltiniaOptions {
  state?: Record<string, StateTree>
  debug?: boolean | DebugOptions
  persist?: PersistOptions
}

export interface DefineStoreOptions<S extends StateTree = StateTree> {
  state: () => S
  getters?: Record<string, (this: Store<S>, state: S) => unknown>
  actions?: Record<string, (...args: unknown[]) => unknown>
  persist?: boolean | PersistOptions
  debug?: boolean | DebugOptions
}

export interface SetupCell<T> {
  readonly __sveltiniaCell: 'state'
  value: T
}

export interface ComputedCell<T> {
  readonly __sveltiniaCell: 'computed'
  readonly value: T
}

export type SetupStore = () => Record<string, unknown>

export interface ReadableStore<S extends StateTree = StateTree> {
  $id: string
  $state: S
  $subscribe(cb: Subscription): () => void
  $onAction(cb: ActionSubscription): () => void
}

export interface WritableStore<S extends StateTree = StateTree> {
  $patch(patch: Partial<S> | ((state: S) => void)): void
  $reset(): void
}

export interface PersistableStore {
  $persist(): Promise<void>
  $restore(): Promise<void>
  $restored: Promise<void>
}

export interface DisposableStore {
  $dispose(): void
}

export interface DebuggableStore {
  _emitDebug?: (event: DebugEvent) => void
}

export interface StoreExtensions {}

export type Store<S extends StateTree = StateTree> = S &
  ReadableStore<S> &
  WritableStore<S> &
  DisposableStore &
  DebuggableStore &
  StoreExtensions

export type SveltiniaPlugin = (ctx: SveltiniaPluginContext) => void | Record<string, unknown>

export interface SveltiniaPluginContext {
  sveltinia: Sveltinia
  store: Store
  options: DefineStoreOptions | Record<string, unknown>
}

export interface App {
  provide(key: string | symbol, value: unknown): void
}

export interface SveltiniaPublic {
  state: Record<string, StateTree>
  use(plugin: SveltiniaPlugin): Sveltinia
  install(app?: App): void
  dispose(): void
  option<K extends keyof SveltiniaOptions>(name: K): SveltiniaOptions[K] | undefined
  forEachStore(callback: (store: Store) => void): void
}

export interface Sveltinia extends SveltiniaPublic {
  _stores: Map<string, Store>
  _plugins: SveltiniaPlugin[]
  _options: SveltiniaOptions
  registerStore(id: string, store: Store, state: StateTree): void
  unregisterStore(id: string): void
  getStore(id: string): Store | undefined
  pluginContext(
    store: Store,
    options: DefineStoreOptions | Record<string, unknown>,
  ): SveltiniaPluginContext
}
