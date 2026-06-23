import { describe, expect, it } from 'vitest'
import { createSveltinia, defineStore } from '../src/index.js'
import { createSveltinia as createSvelteKitRoot } from '../src/adapters/sveltekit.js'

describe('SvelteKit integration', () => {
  it('serializes and hydrates request scoped state', () => {
    const api = createSvelteKitRoot(); const one = api.create(); const useCounter = defineStore('counter', { state: () => ({ count: 0 }) }); useCounter(one).count = 4
    const two = api.create(api.serialize(one)); expect(useCounter(two).count).toBe(4)
  })
})
