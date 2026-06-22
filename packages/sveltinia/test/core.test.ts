import { describe, expect, it, vi } from 'vitest'
import { createPinia, defineStore } from '../src/index.js'

describe('Sveltinia core', () => {
  it('supports options state, getters, actions, patch and reset', () => {
    const pinia = createPinia()
    const useCounter = defineStore('counter', { state: () => ({ count: 0, nested: { n: 1 } }), getters: { double: (s) => s.count * 2 }, actions: { increment() { this.count++ } } })
    const store = useCounter(pinia)
    store.increment(); expect(store.double).toBe(2)
    store.$patch({ count: 4 }); expect(store.count).toBe(4)
    store.$patch((state) => { state.nested.n = 2 }); expect(store.nested.n).toBe(2)
    store.$reset(); expect(store.$state).toEqual({ count: 0, nested: { n: 1 } })
  })
  it('publishes direct mutations and action hooks', () => {
    const pinia = createPinia(); const events: any[] = []; const action = vi.fn()
    const useCounter = defineStore('counter', { state: () => ({ count: 0 }), actions: { increment() { this.count++ } } })
    const store = useCounter(pinia); store.$subscribe((m) => events.push(m)); store.$onAction(action); store.increment()
    expect(events[0].type).toBe('direct'); expect(events[0].events[0].path).toBe('count'); expect(action).toHaveBeenCalledOnce()
  })
})
