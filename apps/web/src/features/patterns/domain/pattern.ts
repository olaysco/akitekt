import type { ArchitectureEdge } from '../../architectures/domain/edge'
import type { ArchitectureNode } from '../../architectures/domain/node'
import type { ArchitectureRegion } from '../../architectures/domain/region'

export type PatternStatus = 'draft' | 'runnable' | 'lesson'

export type PatternScenario = {
  offeredLoadPerMinute: number
  consumerInstances?: number
}

type TemplateItem<T> = Omit<T, 'id'> & { id: string }

export type PatternTemplate = {
  regions: TemplateItem<ArchitectureRegion>[]
  nodes: TemplateItem<ArchitectureNode>[]
  edges: TemplateItem<ArchitectureEdge>[]
}

export type Pattern = {
  id: string
  name: string
  group: string
  status: PatternStatus
  description?: string
}

export type RunnablePattern = Pattern & {
  status: 'runnable'
  description: string
  scenario: PatternScenario
  template: PatternTemplate
}

export type PatternGroup = {
  id: string
  title: string
  patterns: Pattern[]
}
