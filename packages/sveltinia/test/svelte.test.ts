import { describe, expect, it } from 'vitest'
import { createPinia, defineStore } from '../src/index.js'
import { createSvelteKitPinia } from '../src/sveltekit.js'

describe('SvelteKit integration', () => {
  it('serializes and hydrates request scoped state', () => {
    const api = createSvelteKitPinia(); const one = api.create(); const useCounter = defineStore('counter', { state: () => ({ count: 0 }) }); useCounter(one).count = 4
    const two = api.create(api.serialize(one)); expect(useCounter(two).count).toBe(4)
  })
})
