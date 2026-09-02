export type PatternStatus =
  | 'draft'
  | 'runnable'
  | 'lesson'

export type Pattern = {
  id: string
  name: string
  status: PatternStatus
}

export type PatternGroup = {
  id: string
  title: string
  patterns: Pattern[]
}

function pattern(name: string): Pattern {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    status: 'draft',
  }
}

function group(title: string, names: string[]): PatternGroup {
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    patterns: names.map(pattern),
  }
}

export const patternGroups: PatternGroup[] = [
  group('Distributed systems', [
    'Transactional Outbox',
    'Saga',
    'Circuit Breaker',
    'Retry + Backoff',
    'Dead Letter Queue',
    'CQRS',
    'Event Sourcing',
    'Idempotent Consumer',
    'Cache Aside',
    'Bulkhead',
  ]),

  group('Infrastructure', [
    'Load Balancing',
    'Database Replication',
    'Sharding',
    'Leader Election',
    'Service Discovery',
  ]),

  group('Messaging', [
    'RabbitMQ',
    'Kafka',
    'Pub / Sub',
    'SQS',
  ]),
]