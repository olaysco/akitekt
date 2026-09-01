import type { DocumentOperation } from '../../architectures/domain/operation'

export type AIArchitectureCommand = {
  id: string
  message: string
  operations: DocumentOperation[]
  summary?: string
  assumptions?: string[]
}
