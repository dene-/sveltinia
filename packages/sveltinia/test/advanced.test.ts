import { describe, expect, it, vi } from 'vitest'
import { computed, createDebugPlugin, createPersistedState, createSveltinia, defineStore, state } from '../src/index.js'

describe('advanced features', () => {
  it('supports setup stores', () => {
    const sveltinia = createSveltinia(); const useCounter = defineStore('counter', () => { const count = state(1); const double = computed(() => count.value * 2); const inc = () => count.value++; return { count, double, inc } })
    const store = useCounter(sveltinia); store.inc(); expect(store.count).toBe(2); expect(store.double).toBe(4)
  })
  it('restores and persists selected state', async () => {
    const data = new Map<string, string>([['sveltinia:cart', JSON.stringify({ version: 1, state: { items: ['a'] } })]])
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k,v) }
    const sveltinia = createSveltinia(); sveltinia.use(createPersistedState()); const useCart = defineStore('cart', { state: () => ({ items: [] as string[], transient: 1 }), persist: { storage, paths: ['items'] } })
    const cart = useCart(sveltinia); await cart.$restore(); expect(cart.items).toEqual(['a']); cart.items.push('b'); await cart.$persist(); expect(JSON.parse(data.get('sveltinia:cart')!).state).toEqual({ items: ['a','b'] })
  })
  it('ignores unsafe persisted state keys', async () => {
    const data = new Map<string, string>([
      ['sveltinia:cart', '{"state":{"items":["a"],"__proto__":{"polluted":true}}}'],
    ])
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k,v) }
    const sveltinia = createSveltinia(); sveltinia.use(createPersistedState()); const useCart = defineStore('cart', { state: () => ({ items: [] as string[] }), persist: { storage } })
    const cart = useCart(sveltinia); await cart.$restore()
    expect(cart.items).toEqual(['a']); expect(Object.getPrototypeOf(cart.$state)).toBe(Object.prototype)
  })
  it('does not persist inherited or unsafe paths', async () => {
    const data = new Map<string, string>()
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k,v) }
    const sveltinia = createSveltinia(); sveltinia.use(createPersistedState()); const useCart = defineStore('cart', { state: () => ({ items: ['a'] }), persist: { storage, paths: ['items', 'constructor.prototype'] } })
    const cart = useCart(sveltinia); await cart.$persist()
    expect(JSON.parse(data.get('sveltinia:cart')!).state).toEqual({ items: ['a'] })
  })
  it('removes persisted state when the adapter supports it', async () => {
    const data = new Map<string, string>([['sveltinia:cart', '{}']])
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k,v), removeItem: (k: string) => void data.delete(k) }
    const sveltinia = createSveltinia(); sveltinia.use(createPersistedState()); const useCart = defineStore('cart', { state: () => ({ items: [] as string[] }), persist: { storage } })
    await useCart(sveltinia).$removePersisted()
    expect(data.has('sveltinia:cart')).toBe(false)
  })
  it('rejects unsupported persistence storage names', () => {
    const sveltinia = createSveltinia(); sveltinia.use(createPersistedState())
    const useCart = defineStore('cart', { state: () => ({ items: [] as string[] }), persist: { storage: 'localstorage' as 'localStorage' } })
    expect(() => useCart(sveltinia)).toThrow('Unsupported persistence storage "localstorage"')
  })
  it('sends structured debug events', () => {
    const logger = vi.fn(); const sveltinia = createSveltinia({ debug: { enabled: true, logger } }); sveltinia.use(createDebugPlugin())
    const useA = defineStore('a', { state: () => ({ x: 1 }), actions: { set() { this.x = 2 } } }); useA(sveltinia).set()
    expect(logger.mock.calls.some(([event]) => event.kind === 'mutation')).toBe(true); expect(logger.mock.calls.some(([event]) => event.kind === 'action')).toBe(true)
  })
})
