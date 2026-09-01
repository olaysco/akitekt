import type { AIArchitectureCommand } from '../domain/ai-architecture-command'

export type AICommandValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }

export function validateAIArchitectureCommand(
  command: AIArchitectureCommand,
): AICommandValidationResult {
  const errors: string[] = []

  if (!command.id) errors.push('Command id is required.')
  if (!command.message.trim()) errors.push('Command message is required.')
  if (!Array.isArray(command.operations) || command.operations.length === 0) {
    errors.push('At least one operation is required.')
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors }
}
