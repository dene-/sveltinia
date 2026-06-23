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
  it('sends structured debug events', () => {
    const logger = vi.fn(); const sveltinia = createSveltinia({ debug: { enabled: true, logger } }); sveltinia.use(createDebugPlugin())
    const useA = defineStore('a', { state: () => ({ x: 1 }), actions: { set() { this.x = 2 } } }); useA(sveltinia).set()
    expect(logger.mock.calls.some(([event]) => event.kind === 'mutation')).toBe(true); expect(logger.mock.calls.some(([event]) => event.kind === 'action')).toBe(true)
  })
})
