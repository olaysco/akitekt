import type { Position, Size } from './node'

export type AnnotationKind =
  | 'note'
  | 'warning'
  | 'decision'
  | 'question'

export type ArchitectureAnnotation = {
  id: string

  text: string
  kind?: AnnotationKind

  position: Position
  size?: Size
}
