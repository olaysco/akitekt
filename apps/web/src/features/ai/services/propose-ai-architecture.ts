import type { Architecture } from '../../architectures/domain/architecture'
import { applyOperation } from '../../architectures/operations/applyOperation'
import { createAutoLayoutOperations } from '../../architectures/services/createAutoLayoutOperations'
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

  const proposedArchitecture = applyOperation(
    options.architecture,
    {
      type: 'COMPOSITE',
      operations: response.command.operations,
    }
  )

  const command: AIArchitectureCommand = {
    ...response.command,
    operations: [
      ...response.command.operations,
      ...createAutoLayoutOperations(proposedArchitecture),
    ],
  }

  const layoutValidation = validateAIArchitectureCommand(
    command,
    options.architecture,
  )

  if (!layoutValidation.valid) {
  return {
    proposed: false,
    errors: layoutValidation.errors,
  }
}

  return {
    proposed: true,
    command: command,
  }
}
