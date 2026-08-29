import type { ArchitectureNode, Position, Size } from './node'
import type { ArchitectureEdge } from './edge'
import type { ArchitectureRegion } from './region'
import type { ArchitectureAnnotation } from './annotation'

export type AddNodeOperation = {
  type: 'ADD_NODE'
  node: ArchitectureNode
}

export type UpdateNodeOperation = {
  type: 'UPDATE_NODE'
  nodeId: string
  changes: Partial<Omit<ArchitectureNode, 'id'>>
}

export type RemoveNodeOperation = {
  type: 'REMOVE_NODE'
  nodeId: string
}

export type AddEdgeOperation = {
  type: 'ADD_EDGE'
  edge: ArchitectureEdge
}

export type UpdateEdgeOperation = {
  type: 'UPDATE_EDGE'
  edgeId: string
  changes: Partial<Omit<ArchitectureEdge, 'id'>>
}

export type RemoveEdgeOperation = {
  type: 'REMOVE_EDGE'
  edgeId: string
}

export type AddRegionOperation = {
  type: 'ADD_REGION'
  region: ArchitectureRegion
}

export type UpdateRegionOperation = {
  type: 'UPDATE_REGION'
  regionId: string
  changes: Partial<Omit<ArchitectureRegion, 'id'>>
}

export type RemoveRegionOperation = {
  type: 'REMOVE_REGION'
  regionId: string
}

export type AddAnnotationOperation = {
  type: 'ADD_ANNOTATION'
  annotation: ArchitectureAnnotation
}

export type UpdateAnnotationOperation = {
  type: 'UPDATE_ANNOTATION'
  annotationId: string
  changes: Partial<Omit<ArchitectureAnnotation, 'id'>>
}

export type RemoveAnnotationOperation = {
  type: 'REMOVE_ANNOTATION'
  annotationId: string
}

export type ArchitectureOperation =
  | AddNodeOperation
  | UpdateNodeOperation
  | RemoveNodeOperation
  | AddEdgeOperation
  | UpdateEdgeOperation
  | RemoveEdgeOperation
  | AddRegionOperation
  | UpdateRegionOperation
  | RemoveRegionOperation
  | AddAnnotationOperation
  | UpdateAnnotationOperation
  | RemoveAnnotationOperation

export type MoveNodeOperation = {
  type: 'MOVE_NODE'
  nodeId: string
  position: Position
}

export type ResizeNodeOperation = {
  type: 'RESIZE_NODE'
  nodeId: string
  size: Size
}

export type MoveRegionOperation = {
  type: 'MOVE_REGION'
  regionId: string
  position: Position
}

export type ResizeRegionOperation = {
  type: 'RESIZE_REGION'
  regionId: string
  size: Size
}

export type ViewOperation =
  | MoveNodeOperation
  | ResizeNodeOperation
  | MoveRegionOperation
  | ResizeRegionOperation

export type DocumentOperation =
  | ArchitectureOperation
  | ViewOperation
  