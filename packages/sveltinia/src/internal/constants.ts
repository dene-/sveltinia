export const SVELTINIA_PROVISION_KEY = 'sveltinia'

export const CELL_KIND = {
  STATE: 'state',
  COMPUTED: 'computed',
} as const

export const MUTATION_TYPE = {
  DIRECT: 'direct',
  PATCH_OBJECT: 'patch object',
  PATCH_FUNCTION: 'patch function',
  HYDRATE: 'hydrate',
  RESTORE: 'restore',
} as const

export const DEBUG_KIND = {
  MUTATION: 'mutation',
  ACTION: 'action',
  PERSISTENCE: 'persistence',
  LIFECYCLE: 'lifecycle',
} as const

export const REDACTED = '[redacted]'
export const DEFAULT_PERSIST_VERSION = 1
export const LEGACY_PERSIST_VERSION = 0
