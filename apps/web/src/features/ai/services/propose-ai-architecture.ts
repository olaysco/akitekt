import type { Architecture } from '../../architectures/domain/architecture'
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import type { AIArchitectureProvider } from '../domain/ai-architecture-provider'
import { createAIArchitectureRequest } from './create-ai-architecture-request'

type Options = {
  message: string
  architecture: Architecture
  provider: AIArchitectureProvider
}

export async function proposeAIArchitecture(
  options: Options,
): Promise<AIArchitectureCommand> {
  const request = createAIArchitectureRequest({
    message: options.message,
    architecture: options.architecture,
  })

  const response = await options.provider.proposeArchitecture(request)

  return response.command
}
