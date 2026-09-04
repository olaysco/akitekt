import type { Architecture } from '../../architectures/domain/architecture'

export type SimulationTone = 'ok' | 'warn' | 'fail'

export type SimulationCapacity = {
  nodeId: string
  label: string
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

export function simulateArchitecture(input: SimulationInput): SimulationResult {
  const capacities = input.architecture.nodes.flatMap((node): SimulationCapacity[] => {
    const instances = node.type === 'worker'
      ? input.workerInstances
      : node.metadata.instances ?? 1
    const capacity = capacityPerMinute(
      node.behavior.capacity?.requestsPerSecond,
      instances,
    )

    if (capacity === null) return []

    const utilization = input.offeredLoadPerMinute / capacity

    return [{
      nodeId: node.id,
      label: node.type === 'worker' ? `${node.name} workers` : node.name,
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
        text: `Demand exceeds declared capacity by ${Math.round((capacity.utilization - 1) * 100)}%.`,
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

    if (workerIds.length > 0 && workerCapacity > 0 && workerCapacity < input.offeredLoadPerMinute) {
      concerns.push({
        id: `queue-pressure-${queue.id}`,
        severity: 'high',
        component: queue.name,
        text: `Queue grows by approximately ${Math.round(input.offeredLoadPerMinute - workerCapacity)} messages per minute.`,
      })
    }
  }

  const bottleneck = capacities.length
    ? capacities.reduce((current, capacity) =>
      capacity.utilization > current.utilization ? capacity : current,
    )
    : null

  return { capacities, concerns, bottleneck }
}
