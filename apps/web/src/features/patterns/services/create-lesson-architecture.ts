import type { Architecture } from '../../architectures/domain/architecture'
import type { Lesson } from '../domain/pattern'

export function createLessonArchitecture(lesson: Lesson): Architecture {
  const suffix = crypto.randomUUID()
  const localIds = new Map<string, string>()
  const registerId = (localId: string) => {
    const id = `${lesson.id}-${localId}-${suffix}`
    localIds.set(localId, id)
    return id
  }
  const resolveId = (localId: string) => {
    const id = localIds.get(localId)

    if (!id) throw new Error(`Unknown pattern id: ${localId}`)

    return id
  }

  const regions = lesson.template.regions.map((region) => ({
    ...region,
    id: registerId(region.id),
  }))
  const nodes = lesson.template.nodes.map((node) => ({
    ...node,
    id: registerId(node.id),
    regionId: node.regionId ? resolveId(node.regionId) : undefined,
  }))
  const edges = lesson.template.edges.map((edge) => ({
    ...edge,
    id: registerId(edge.id),
    source: { ...edge.source, nodeId: resolveId(edge.source.nodeId) },
    target: { ...edge.target, nodeId: resolveId(edge.target.nodeId) },
  }))

  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    name: lesson.name,
    schemaVersion: 1,

    nodes,
    edges,
    regions,
    annotations: [],

    metadata: {
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}
