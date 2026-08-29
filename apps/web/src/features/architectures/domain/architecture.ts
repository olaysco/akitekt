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

export type Architecture = {
  id: string
  name: string

  schemaVersion: number

  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
  regions: ArchitectureRegion[]
  annotations: ArchitectureAnnotation[]

  metadata?: ArchitectureMetadata
}
