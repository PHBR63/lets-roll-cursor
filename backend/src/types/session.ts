/**
 * Tipos relacionados a sessões
 */

export interface CreateSessionData {
  name?: string
  notes?: string
}

export interface UpdateSessionData {
  name?: string
  notes?: string
  endedAt?: string | null
}

