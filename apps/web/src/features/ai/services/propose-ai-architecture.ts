import type { Architecture } from '../../architectures/domain/architecture'
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import type { AIArchitectureProvider } from '../domain/ai-architecture-provider'
import { createAIArchitectureRequest } from './create-ai-architecture-request'
import { validateAIArchitectureCommand } from './validate-ai-command'

type Options = {
  message: string
  architecture: Architecture
  provider: AIArchitectureProvider
}

export type AIArchitectureProposalResult =
  | { proposed: true; command: AIArchitectureCommand }
  | { proposed: false; errors: string[] }

export async function proposeAIArchitecture(
  options: Options,
): Promise<AIArchitectureProposalResult> {
  const request = createAIArchitectureRequest({
    message: options.message,
    architecture: options.architecture,
  })

  const response = await options.provider.proposeArchitecture(request)
  const validation = validateAIArchitectureCommand(
    response.command,
    options.architecture,
  )

  if (!validation.valid) {
    return {
      proposed: false,
      errors: validation.errors,
    }
  }

  return {
    proposed: true,
    command: response.command,
  }
}
