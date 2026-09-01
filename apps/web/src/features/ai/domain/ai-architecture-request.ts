import type { Architecture } from '../../architectures/domain/architecture'

export type AIArchitectureRequest = {
  id: string
  message: string
  architecture: Architecture
}
