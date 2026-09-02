import { useArchitectureStore } from '../../architectures/stores/architecture.store'
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import { validateAIArchitectureCommand } from './validate-ai-command'

export function applyAIArchitectureCommand(command: AIArchitectureCommand) {
  const architectureStore = useArchitectureStore()
  const validation = validateAIArchitectureCommand(
    command,
    architectureStore.architecture,
  )

  if (!validation.valid) {
    return {
      applied: false as const,
      errors: validation.errors,
    }
  }

  architectureStore.execute({
    type: 'COMPOSITE',
    operations: command.operations,
  })

  return { applied: true as const }
}
