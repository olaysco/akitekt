import type { RetryPolicy } from './node'

export type EdgeType =
  | 'sync'
  | 'async'
  | 'event'
  | 'query'
  | 'replication'
  | 'stream'
  | 'custom'

export type Protocol =
  | 'http'
  | 'https'
  | 'grpc'
  | 'tcp'
  | 'websocket'
  | 'sql'
  | 'amqp'
  | 'kafka'
  | 'epp'
  | 'dns'
  | 'mqtt'
  | 'coap'
  | 'ftp'
  | 'sftp'
  | 'smtp'
  | 'custom'

export type NodeEndpoint = {
  nodeId: string
  portId?: string
}

export type EdgeBehavior = {
  latencyMs?: number
  timeoutMs?: number
  failureRate?: number
  retry?: RetryPolicy
}

export type ArchitectureEdge = {
  id: string

  source: NodeEndpoint
  target: NodeEndpoint

  type: EdgeType
  protocol?: Protocol

  label?: string
  behavior: EdgeBehavior
}
