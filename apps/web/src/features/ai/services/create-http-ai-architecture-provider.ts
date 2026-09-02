import type { AIArchitectureProvider } from '../domain/ai-architecture-provider'
import type { AIArchitectureRequest } from '../domain/ai-architecture-request'
import type { AIArchitectureResponse } from '../domain/ai-architecture-response'

type Options = {
  endpoint: string
  fetch?: typeof globalThis.fetch
}

export function createHTTPAIArchitectureProvider(
  options: Options,
): AIArchitectureProvider {
  const fetcher = options.fetch ?? globalThis.fetch

  return {
    async proposeArchitecture(
      request: AIArchitectureRequest,
    ): Promise<AIArchitectureResponse> {
      const response = await fetcher(options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Unable to generate an architecture proposal.')
      }

      return response.json() as Promise<AIArchitectureResponse>
    },
  }
}
