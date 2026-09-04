import type { Architecture } from '../../architectures/domain/architecture'
import type { DocumentOperation } from '../../architectures/domain/operation'
import type { RunnablePattern } from '../domain/pattern'

export type PatternAppendPlan = {
  operation: DocumentOperation
  nodeIds: string[]
}

function materializePatternOperations(
  pattern: RunnablePattern,
  offsetY: number,
): DocumentOperation[] {
  const suffix = crypto.randomUUID()
  const localIds = new Map<string, string>()
  const registerId = (localId: string) => {
    const id = `${pattern.id}-${localId}-${suffix}`
    localIds.set(localId, id)
    return id
  }
  const resolveId = (localId: string) => {
    const id = localIds.get(localId)

    if (!id) throw new Error(`Unknown pattern id: ${localId}`)

    return id
  }

  const regions = pattern.template.regions.map((region) => ({
    ...region,
    id: registerId(region.id),
    position: {
      ...region.position,
      y: region.position.y + offsetY,
    },
  }))
  const nodes = pattern.template.nodes.map((node) => ({
    ...node,
    id: registerId(node.id),
    position: {
      ...node.position,
      y: node.position.y + offsetY,
    },
    regionId: node.regionId ? resolveId(node.regionId) : undefined,
  }))
  const edges = pattern.template.edges.map((edge) => ({
    ...edge,
    id: registerId(edge.id),
    source: { ...edge.source, nodeId: resolveId(edge.source.nodeId) },
    target: { ...edge.target, nodeId: resolveId(edge.target.nodeId) },
  }))

  return [
    ...regions.map((region): DocumentOperation => ({ type: 'ADD_REGION', region })),
    ...nodes.map((node): DocumentOperation => ({ type: 'ADD_NODE', node })),
    ...edges.map((edge): DocumentOperation => ({ type: 'ADD_EDGE', edge })),
  ]
}

function nextPatternOffsetY(architecture: Architecture): number {
  const nodeBottom = architecture.nodes.reduce(
    (bottom, node) => Math.max(bottom, node.position.y + (node.size?.height ?? 88)),
    0,
  )
  const regionBottom = architecture.regions.reduce(
    (bottom, region) => Math.max(bottom, region.position.y + region.size.height),
    0,
  )

  return Math.max(nodeBottom, regionBottom) + 160
}

export function createPatternAppendPlan(
  architecture: Architecture,
  pattern: RunnablePattern,
): PatternAppendPlan {
  const patternOperations = materializePatternOperations(
    pattern,
    nextPatternOffsetY(architecture),
  )
  const nodeIds = patternOperations
    .filter((operation) => operation.type === 'ADD_NODE')
    .map((operation) => operation.node.id)

  return {
    operation: {
      type: 'COMPOSITE',
      operations: patternOperations,
    },
    nodeIds,
  }
}
