import { rm } from 'node:fs/promises'

await rm(process.argv[2] ?? 'dist', { force: true, recursive: true })
