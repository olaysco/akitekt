import type { Architecture } from '../../architectures/domain/architecture'
import type { ArchitectureEdge } from '../../architectures/domain/edge'
import type { NodeBehavior } from '../../architectures/domain/node'

export type TraceStatus = 'ok' | 'warn' | 'fail'

export type TraceStep = {
  id: string
  edgeId: string
  targetId: string
  label: string
  time: string
  elapsedMs: number
  status: TraceStatus
}

export type ExecutionTrace = {
  steps: TraceStep[]
  status: TraceStatus
  summary: string
}

const defaultLatencyMs = 120
const degradedFailureRate = 0.2

export type InjectionKind =
  | 'unavailable'
  | 'latency5s'
  | 'latency30s'
  | 'failures20'

export type Injection = {
  nodeId: string
  kind: InjectionKind
}

export const injectionOptions: { kind: InjectionKind; label: string }[] = [
  { kind: 'unavailable', label: 'Service unavailable' },
  { kind: 'latency5s', label: '5 second latency' },
  { kind: 'latency30s', label: '30 second latency' },
  { kind: 'failures20', label: '20 % request failures' },
]

export function injectionLabel(kind: InjectionKind): string {
  return injectionOptions.find((option) => option.kind === kind)?.label ?? kind
}

function injectedBehavior(
  nodeId: string,
  behavior: NodeBehavior,
  injection: Injection | null,
): NodeBehavior {
  if (!injection || injection.nodeId !== nodeId) {
    return behavior
  }

  if (injection.kind === 'unavailable') {
    return { ...behavior, failureRate: 1 }
  }

  if (injection.kind === 'latency5s') {
    return { ...behavior, latencyMs: 5000 }
  }

  if (injection.kind === 'latency30s') {
    return { ...behavior, latencyMs: 30000 }
  }

  return { ...behavior, failureRate: degradedFailureRate }
}

function entryNodeIds(architecture: Architecture): string[] {
  const targets = new Set(
    architecture.edges.map((edge) => edge.target.nodeId),
  )

  const roots = architecture.nodes
    .filter((node) => !targets.has(node.id))
    .map((node) => node.id)

  return roots.length > 0
    ? roots
    : architecture.nodes.slice(0, 1).map((node) => node.id)
}

function outgoingEdges(
  architecture: Architecture,
): Map<string, ArchitectureEdge[]> {
  const outgoing = new Map<string, ArchitectureEdge[]>()

  for (const edge of architecture.edges) {
    const edges = outgoing.get(edge.source.nodeId) ?? []

    edges.push(edge)
    outgoing.set(edge.source.nodeId, edges)
  }

  return outgoing
}

export function createExecutionTrace(
  architecture: Architecture,
  injection: Injection | null = null,
): ExecutionTrace {
  const nodeById = new Map(
    architecture.nodes.map((node) => [node.id, node]),
  )
  const outgoing = outgoingEdges(architecture)

  const steps: TraceStep[] = []
  const walked = new Set<string>()
  const queue = entryNodeIds(architecture).map((nodeId) => ({
    nodeId,
    elapsedMs: 0,
    broken: false,
  }))

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const edge of outgoing.get(current.nodeId) ?? []) {
      if (walked.has(edge.id)) {
        continue
      }

      walked.add(edge.id)

      const source = nodeById.get(edge.source.nodeId)
      const target = nodeById.get(edge.target.nodeId)

      const sourceBehavior = source
        ? injectedBehavior(source.id, source.behavior, injection)
        : undefined
      const targetBehavior = target
        ? injectedBehavior(target.id, target.behavior, injection)
        : undefined

      const latencyMs = targetBehavior?.latencyMs ?? defaultLatencyMs
      const elapsedMs = current.elapsedMs + latencyMs
      const timeoutMs = sourceBehavior?.timeoutMs
      const failureRate = targetBehavior?.failureRate ?? 0

      const status: TraceStatus =
        current.broken ||
        failureRate >= 1 ||
        (timeoutMs !== undefined && elapsedMs > timeoutMs)
          ? 'fail'
          : failureRate >= degradedFailureRate
            ? 'warn'
            : 'ok'

      steps.push({
        id: `${edge.id}-${steps.length}`,
        edgeId: edge.id,
        targetId: edge.target.nodeId,
        label: edge.label ?? target?.name ?? edge.type,
        time: `${Math.round(elapsedMs)} ms`,
        elapsedMs,
        status,
      })

      queue.push({
        nodeId: edge.target.nodeId,
        elapsedMs,
        broken: status === 'fail',
      })
    }
  }

  if (steps.length === 0) {
    return {
      steps,
      status: 'ok',
      summary: 'nothing to run',
    }
  }

  const slowest = Math.round(
    steps.reduce((total, step) => Math.max(total, step.elapsedMs), 0),
  )
  const budgetMs = architecture.requirements?.latencyBudgetMs
  const overBudget = budgetMs !== undefined && slowest > budgetMs

  const failed = steps.some((step) => step.status === 'fail')
  const degraded = steps.some((step) => step.status === 'warn')
  const status: TraceStatus = failed || overBudget
    ? 'fail'
    : degraded
      ? 'warn'
      : 'ok'

  const budgetNote = budgetMs === undefined
    ? ''
    : overBudget
      ? ` · over ${budgetMs} ms budget`
      : ` · within ${budgetMs} ms budget`

  return {
    steps,
    status,
    summary: `${
      status === 'fail' ? 'FAILED' : status === 'warn' ? 'DEGRADED' : 'OK'
    } · ${slowest} ms${budgetNote}`,
  }
}
