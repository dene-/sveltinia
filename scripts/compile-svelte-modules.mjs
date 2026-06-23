import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { compileModule } from 'svelte/compiler'

async function compileSvelteModules(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await compileSvelteModules(path)
    } else if (entry.name.endsWith('.svelte.js')) {
      const source = await readFile(path, 'utf8')
      const compiled = compileModule(source, { filename: path, generate: 'client' })
      await writeFile(path, compiled.js.code)
    }
  }
}

await compileSvelteModules(process.argv[2] ?? 'dist')
