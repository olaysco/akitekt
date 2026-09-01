import { ref } from 'vue'
import type { Architecture } from '../../architectures/domain/architecture'
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import type { AIArchitectureProvider } from '../domain/ai-architecture-provider'
import { applyAIArchitectureCommand } from '../services/apply-ai-command'
import { proposeAIArchitecture } from '../services/propose-ai-architecture'

type Options = {
  provider: AIArchitectureProvider
  getArchitecture: () => Architecture
}

export function useAIArchitectureProposal(options: Options) {
  const proposal = ref<AIArchitectureCommand | null>(null)
  const errors = ref<string[]>([])
  const isProposing = ref(false)

  async function propose(message: string) {
    isProposing.value = true
    errors.value = []

    try {
      const result = await proposeAIArchitecture({
        message,
        architecture: options.getArchitecture(),
        provider: options.provider,
      })

      if (!result.proposed) {
        proposal.value = null
        errors.value = result.errors
        return
      }

      proposal.value = result.command
    } catch (error) {
      proposal.value = null
      errors.value = [
        error instanceof Error
          ? error.message
          : 'Unable to generate an architecture proposal.',
      ]
    } finally {
      isProposing.value = false
    }
  }

  function applyProposal() {
    if (!proposal.value) {
      return {
        applied: false as const,
        errors: ['No architecture proposal is available.'],
      }
    }

    const result = applyAIArchitectureCommand(proposal.value)

    if (result.applied) {
      proposal.value = null
      errors.value = []
    } else {
      errors.value = result.errors
    }

    return result
  }

  function discardProposal() {
    proposal.value = null
    errors.value = []
  }

  return {
    proposal,
    errors,
    isProposing,
    propose,
    applyProposal,
    discardProposal,
  }
}
