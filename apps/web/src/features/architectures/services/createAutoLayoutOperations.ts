import type { Architecture } from '../domain/architecture'
import type { DocumentOperation } from '../domain/operation'

const startX = 80
const startY = 120
const layerGap = 280
const rowGap = 140

export function createAutoLayoutOperations(
  architecture: Architecture,
): DocumentOperation[] {
  const nodeIds = new Set(architecture.nodes.map((node) => node.id))
  const incoming = new Map<string, number>()
  const outgoing = new Map<string, string[]>()
  const layers = new Map<string, number>()

  for (const node of architecture.nodes) {
    incoming.set(node.id, 0)
    outgoing.set(node.id, [])
  }

  for (const edge of architecture.edges) {
    if (!nodeIds.has(edge.source.nodeId) || !nodeIds.has(edge.target.nodeId)) {
      continue
    }

    outgoing.get(edge.source.nodeId)!.push(edge.target.nodeId)
    incoming.set(
      edge.target.nodeId,
      (incoming.get(edge.target.nodeId) ?? 0) + 1,
    )
  }

  const queue = architecture.nodes
    .filter((node) => incoming.get(node.id) === 0)
    .sort((left, right) => left.name.localeCompare(right.name))

  for (const node of queue) {
    layers.set(node.id, 0)
  }

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index]
    const layer = layers.get(node.id) ?? 0

    for (const targetId of outgoing.get(node.id) ?? []) {
      layers.set(
        targetId,
        Math.max(layers.get(targetId) ?? 0, layer + 1),
      )

      const nextIncoming = (incoming.get(targetId) ?? 1) - 1
      incoming.set(targetId, nextIncoming)

      if (nextIncoming === 0) {
        const target = architecture.nodes.find(
          (item) => item.id === targetId,
        )

        if (target) queue.push(target)
      }
    }
  }

  const fallbackLayer = Math.max(0, ...layers.values()) + 1

  for (const node of architecture.nodes) {
    if (!layers.has(node.id)) {
      layers.set(node.id, fallbackLayer)
    }
  }

  const nodesByLayer = new Map<number, typeof architecture.nodes>()

  for (const node of architecture.nodes) {
    const layer = layers.get(node.id) ?? fallbackLayer
    const nodes = nodesByLayer.get(layer) ?? []

    nodes.push(node)
    nodesByLayer.set(layer, nodes)
  }

  return Array.from(nodesByLayer.entries()).flatMap(([layer, nodes]) =>
    nodes
      .sort((left, right) => left.name.localeCompare(right.name))
      .flatMap((node, index): DocumentOperation[] => {
        const position = {
          x: startX + layer * layerGap,
          y: startY + index * rowGap,
        }

        if (
          node.position.x === position.x &&
          node.position.y === position.y
        ) {
          return []
        }

        return [{
          type: 'MOVE_NODE',
          nodeId: node.id,
          position,
        }]
      }),
  )
}
