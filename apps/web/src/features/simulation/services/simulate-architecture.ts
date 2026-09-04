import type { Architecture } from '../../architectures/domain/architecture'
import type { ArchitectureEdge } from '../../architectures/domain/edge'

export type SimulationTone = 'ok' | 'warn' | 'fail'

export type SimulationCapacity = {
  nodeId: string
  label: string
  loadPerMinute: number
  capacityPerMinute: number
  utilization: number
  tone: SimulationTone
}

export type SimulationConcern = {
  id: string
  severity: 'high' | 'med' | 'low'
  component: string
  text: string
}

export type SimulationResult = {
  capacities: SimulationCapacity[]
  concerns: SimulationConcern[]
  bottleneck: SimulationCapacity | null
  loadPerMinute: Record<string, number>
}

type SimulationInput = {
  architecture: Architecture
  offeredLoadPerMinute: number
  workerInstances: number
}

function capacityPerMinute(
  requestsPerSecond: number | undefined,
  instances: number,
): number | null {
  if (requestsPerSecond === undefined || !Number.isFinite(requestsPerSecond)) {
    return null
  }

  return requestsPerSecond * 60 * instances
}

function toneFor(utilization: number): SimulationTone {
  if (utilization >= 1) return 'fail'
  if (utilization >= 0.8) return 'warn'
  return 'ok'
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

function propagateLoad(
  architecture: Architecture,
  offeredLoadPerMinute: number,
): Record<string, number> {
  const outgoing = outgoingEdges(architecture)
  const loadPerMinute: Record<string, number> = {}
  const entries = entryNodeIds(architecture)

  for (const nodeId of entries) {
    loadPerMinute[nodeId] = offeredLoadPerMinute
  }

  const queue = [...entries]
  const walked = new Set<string>()

  while (queue.length > 0) {
    const nodeId = queue.shift()!

    for (const edge of outgoing.get(nodeId) ?? []) {
      if (walked.has(edge.id)) {
        continue
      }

      walked.add(edge.id)

      const share = edge.share ?? 1
      const downstream = (loadPerMinute[nodeId] ?? 0) * share

      loadPerMinute[edge.target.nodeId] =
        (loadPerMinute[edge.target.nodeId] ?? 0) + downstream

      queue.push(edge.target.nodeId)
    }
  }

  return loadPerMinute
}

function formatPerMinute(value: number): string {
  const rounded = Math.round(value)

  if (rounded < 1000) {
    return `${rounded} / min`
  }

  const thousands = rounded / 1000

  return `${
    Number.isInteger(thousands) ? thousands : thousands.toFixed(1)
  } k / min`
}

export function simulateArchitecture(input: SimulationInput): SimulationResult {
  const loadPerMinute = propagateLoad(
    input.architecture,
    input.offeredLoadPerMinute,
  )

  const capacities = input.architecture.nodes.flatMap((node): SimulationCapacity[] => {
    const instances = node.type === 'worker'
      ? input.workerInstances
      : node.metadata.instances ?? 1
    const capacity = capacityPerMinute(
      node.behavior.capacity?.requestsPerSecond,
      instances,
    )

    if (capacity === null) return []

    const load = loadPerMinute[node.id] ?? 0
    const utilization = load / capacity

    return [{
      nodeId: node.id,
      label: node.type === 'worker' ? `${node.name} workers` : node.name,
      loadPerMinute: load,
      capacityPerMinute: capacity,
      utilization,
      tone: toneFor(utilization),
    }]
  })

  const concerns: SimulationConcern[] = capacities.flatMap((capacity): SimulationConcern[] => {
    if (capacity.tone === 'fail') {
      return [{
        id: `overload-${capacity.nodeId}`,
        severity: 'high' as const,
        component: capacity.label,
        text: `Takes ${formatPerMinute(capacity.loadPerMinute)} against a ceiling of ${formatPerMinute(capacity.capacityPerMinute)} — demand exceeds capacity by ${Math.round((capacity.utilization - 1) * 100)}%.`,
      }]
    }

    if (capacity.tone === 'warn') {
      return [{
        id: `utilization-${capacity.nodeId}`,
        severity: 'med' as const,
        component: capacity.label,
        text: `Operating at ${Math.round(capacity.utilization * 100)}% of declared capacity.`,
      }]
    }

    return []
  })

  for (const queue of input.architecture.nodes.filter((node) => node.type === 'queue')) {
    const workerIds = input.architecture.edges
      .filter((edge) => edge.source.nodeId === queue.id)
      .map((edge) => edge.target.nodeId)
    const workerCapacity = capacities
      .filter((capacity) => workerIds.includes(capacity.nodeId))
      .reduce((total, capacity) => total + capacity.capacityPerMinute, 0)
    const arriving = loadPerMinute[queue.id] ?? 0

    if (workerIds.length > 0 && workerCapacity > 0 && workerCapacity < arriving) {
      concerns.push({
        id: `queue-pressure-${queue.id}`,
        severity: 'high',
        component: queue.name,
        text: `Queue grows by approximately ${Math.round(arriving - workerCapacity)} messages per minute.`,
      })
    }
  }

  const bottleneck = capacities.length
    ? capacities.reduce((current, capacity) =>
      capacity.utilization > current.utilization ? capacity : current,
    )
    : null

  return { capacities, concerns, bottleneck, loadPerMinute }
}
