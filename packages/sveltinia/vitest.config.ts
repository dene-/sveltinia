import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { include: ['packages/sveltinia/test/**/*.test.ts', 'test/**/*.test.ts'] },
})
