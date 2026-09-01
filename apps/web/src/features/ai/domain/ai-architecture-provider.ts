import type { AIArchitectureRequest } from './ai-architecture-request'
import type { AIArchitectureResponse } from './ai-architecture-response'

export interface AIArchitectureProvider {
  proposeArchitecture(
    request: AIArchitectureRequest,
  ): Promise<AIArchitectureResponse>
}
