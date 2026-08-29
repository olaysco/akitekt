export type NodeType =
  | 'client'
  | 'service'
  | 'worker'
  | 'database'
  | 'cache'
  | 'queue'
  | 'stream'
  | 'load-balancer'
  | 'gateway'
  | 'external'
  | 'storage'
  | 'scheduler'
  | 'custom'

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type PortDirection =
  | 'input'
  | 'output'
  | 'bidirectional'

export type PortKind =
  | 'request'
  | 'event'
  | 'data'
  | 'stream'
  | 'custom'

export type Port = {
  id: string
  name?: string
  direction: PortDirection
  kind?: PortKind
}

export type RetryPolicy = {
  maxAttempts: number
  backoffMs?: number
  exponential?: boolean
}

export type NodeMetadata = {
  technology?: string
  instances?: number
  tags?: string[]
  properties?: Record<string, string | number | boolean>
}

export type NodeCapacity = {
  requestsPerSecond?: number
  concurrentRequests?: number
}

export type NodeBehavior = {
  latencyMs?: number
  timeoutMs?: number

  capacity?: NodeCapacity

  availability?: number
  failureRate?: number

  retry?: RetryPolicy
  idempotent?: boolean
}

export type ArchitectureNode = {
  id: string

  type: NodeType
  name: string
  description?: string

  position: Position
  size?: Size

  ports?: Port[]

  metadata: NodeMetadata
  behavior: NodeBehavior

  regionId?: string
}
