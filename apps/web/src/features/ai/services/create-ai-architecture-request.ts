import type { Architecture } from '../../architectures/domain/architecture'
import type { AIArchitectureRequest } from '../domain/ai-architecture-request'

type Options = {
  message: string
  architecture: Architecture
}

export function createAIArchitectureRequest(
  options: Options,
): AIArchitectureRequest {
  return {
    id: crypto.randomUUID(),
    message: options.message,
    architecture: cloneArchitecture(options.architecture),
  }
}

function cloneArchitecture(architecture: Architecture): Architecture {
  return {
    ...architecture,
    nodes: architecture.nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      size: node.size && { ...node.size },
      ports: node.ports?.map((port) => ({ ...port })),
      metadata: {
        ...node.metadata,
        tags: node.metadata.tags && [...node.metadata.tags],
        properties: node.metadata.properties && { ...node.metadata.properties },
      },
      behavior: {
        ...node.behavior,
        capacity: node.behavior.capacity && { ...node.behavior.capacity },
        retry: node.behavior.retry && { ...node.behavior.retry },
      },
    })),
    edges: architecture.edges.map((edge) => ({
      ...edge,
      source: { ...edge.source },
      target: { ...edge.target },
      behavior: {
        ...edge.behavior,
        retry: edge.behavior.retry && { ...edge.behavior.retry },
      },
    })),
    regions: architecture.regions.map((region) => ({
      ...region,
      position: { ...region.position },
      size: { ...region.size },
    })),
    annotations: architecture.annotations.map((annotation) => ({
      ...annotation,
      position: { ...annotation.position },
      size: annotation.size && { ...annotation.size },
    })),
    metadata: architecture.metadata && {
      ...architecture.metadata,
      tags: architecture.metadata.tags && [...architecture.metadata.tags],
    },
  }
}
