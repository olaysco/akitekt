import type { ArchitectureNode } from './node'
import type { ArchitectureEdge } from './edge'
import type { ArchitectureRegion } from './region'
import type { ArchitectureAnnotation } from './annotation'

export type ArchitectureMetadata = {
  description?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export type ArchitectureRequirements = {
  offeredLoadPerMinute: number
  latencyBudgetMs?: number
}

export type Architecture = {
  id: string
  name: string

  schemaVersion: number

  requirements?: ArchitectureRequirements

  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
  regions: ArchitectureRegion[]
  annotations: ArchitectureAnnotation[]

  metadata?: ArchitectureMetadata
}
