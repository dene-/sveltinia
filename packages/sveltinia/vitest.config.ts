import { defineConfig } from 'vitest/config'
import ts from 'typescript'
import { compileModule } from 'svelte/compiler'

export default defineConfig({
  plugins: [
    {
      name: 'sveltinia-svelte-module',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.svelte.ts')) return
        const source = ts.transpileModule(code, {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        }).outputText
        return compileModule(source, { filename: id, generate: 'client' }).js
      },
    },
  ],
  test: { include: ['packages/sveltinia/test/**/*.test.ts', 'test/**/*.test.ts'] },
})
