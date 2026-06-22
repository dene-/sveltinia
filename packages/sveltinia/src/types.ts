export type StateTree = Record<string, any>
export type MutationType = 'direct' | 'patch object' | 'patch function' | 'hydrate' | 'restore'
export interface Mutation { type: MutationType; storeId: string; events?: Array<{ path: string; oldValue: unknown; newValue: unknown }>; payload?: unknown }
export interface SubscriptionOptions { detached?: boolean; flush?: 'sync' | 'post' }
export type Subscription = (mutation: Mutation, state: StateTree) => void
export interface ActionContext { name: string; args: unknown[]; store: Store; after(cb: (value: unknown) => void): void; onError(cb: (error: unknown) => void): void }
export type ActionSubscription = (context: ActionContext) => void
export interface StorageAdapter { getItem(key: string): string | null | Promise<string | null>; setItem(key: string, value: string): void | Promise<void>; removeItem?(key: string): void | Promise<void> }
export interface PersistOptions { enabled?: boolean; key?: string; storage?: 'localStorage' | 'sessionStorage' | StorageAdapter; paths?: string[]; version?: number; migrate?: (state: any, fromVersion: number) => any | Promise<any>; serializer?: { serialize(v: any): string; deserialize(v: string): any }; beforeRestore?: (ctx: { store: Store }) => void; afterRestore?: (ctx: { store: Store }) => void }
export interface DebugEvent { kind: 'mutation' | 'action' | 'persistence' | 'lifecycle'; storeId: string; name?: string; mutation?: Mutation; duration?: number; error?: unknown; detail?: unknown }
export interface DebugOptions { enabled?: boolean; logger?: (event: DebugEvent) => void; redact?: string[] }
export interface PiniaOptions { state?: Record<string, StateTree>; debug?: boolean | DebugOptions; persist?: PersistOptions }
export interface DefineStoreOptions<S extends StateTree = StateTree> { state: () => S; getters?: Record<string, (this: Store<S>, state: S) => unknown>; actions?: Record<string, (...args: any[]) => any>; persist?: boolean | PersistOptions; debug?: boolean | DebugOptions }
export interface SetupCell<T> { readonly __sveltiniaCell: 'state'; value: T }
export interface ComputedCell<T> { readonly __sveltiniaCell: 'computed'; readonly value: T }
export type SetupStore = () => Record<string, any>
export type Store<S extends StateTree = StateTree> = S & { $id: string; $state: S; $patch(patch: Partial<S> | ((state: S) => void)): void; $reset(): void; $subscribe(cb: Subscription, options?: SubscriptionOptions): () => void; $onAction(cb: ActionSubscription): () => void; $dispose(): void; $persist(): Promise<void>; $restore(): Promise<void>; _emitDebug?: (event: DebugEvent) => void }
export interface Pinia { state: Record<string, StateTree>; _stores: Map<string, Store>; _plugins: Array<(ctx: { pinia: Pinia; store: Store; options: any }) => void | Record<string, any>>; _options: PiniaOptions; use(plugin: (ctx: { pinia: Pinia; store: Store; options: any }) => void | Record<string, any>): Pinia; install(app?: any): void; dispose(): void }
