import { ref, type Ref } from 'vue'
import type { Node } from '@vue-flow/core'
import type { DocumentOperation } from '../../architectures/domain/operation'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'
import type { ArchitectureNode as DomainArchitectureNode, Position } from '../../architectures/domain/node'

export type RegionDraft = {
  start: { x: number; y: number }
  current: { x: number; y: number }
}

type Options = {
  screenToFlowCoordinate: (position: { x: number; y: number }) => Position
  regionToolActive: Ref<boolean>
  onRegionCreated?: () => void
}

export function useCanvasRegions(options: Options) {
  const architectureStore = useArchitectureStore()
  const regionDraft = ref<RegionDraft | null>(null)

  function getRegionBounds(draft: RegionDraft) {
    const x = Math.min(draft.start.x, draft.current.x)
    const y = Math.min(draft.start.y, draft.current.y)
    const width = Math.abs(draft.current.x - draft.start.x)
    const height = Math.abs(draft.current.y - draft.start.y)

    return { x, y, width, height }
  }

  function findRegionForNode(node: DomainArchitectureNode, position: Position): string | undefined {
    const width = node.size?.width ?? 204
    const height = node.size?.height ?? 88
    const centerX = position.x + width / 2
    const centerY = position.y + height / 2

    const region = architectureStore.architecture.regions.find((region) =>
      centerX >= region.position.x &&
      centerX <= region.position.x + region.size.width &&
      centerY >= region.position.y &&
      centerY <= region.position.y + region.size.height,
    )

    return region?.id
  }

  function resizeRegion(regionId: string | undefined, size: { width: number; height: number }) {
    if (!regionId) return

    architectureStore.execute({
      type: 'RESIZE_REGION',
      regionId,
      size,
    })
  }

  function moveRegion(node: Node) {
    const regionId = node.data?.regionId
    if (!regionId) return

    const region = architectureStore.architecture.regions.find((item) => item.id === regionId)
    if (!region) return

    const nextPosition = {
      x: node.position.x,
      y: node.position.y,
    }

    const deltaX = nextPosition.x - region.position.x
    const deltaY = nextPosition.y - region.position.y

    if (deltaX === 0 && deltaY === 0) return

    const memberNodes = architectureStore.architecture.nodes.filter((item) => item.regionId === regionId)

    architectureStore.execute({
      type: 'COMPOSITE',
      operations: [
        {
          type: 'MOVE_REGION',
          regionId,
          position: nextPosition,
        },
        ...memberNodes.map((item) => ({
          type: 'MOVE_NODE' as const,
          nodeId: item.id,
          position: {
            x: item.position.x + deltaX,
            y: item.position.y + deltaY,
          },
        })),
      ],
    })
  }

  function moveArchitectureNode(node: Node) {
    const architectureNode = architectureStore.architecture.nodes.find((item) => item.id === node.id)
    if (!architectureNode) return

    const nextPosition = {
      x: node.position.x,
      y: node.position.y,
    }

    const nextRegionId = findRegionForNode(architectureNode, nextPosition)

    const operations: DocumentOperation[] = [
      {
        type: 'MOVE_NODE',
        nodeId: node.id,
        position: nextPosition,
      },
    ]

    if (architectureNode.regionId !== nextRegionId) {
      operations.push({
        type: 'UPDATE_NODE',
        nodeId: node.id,
        changes: {
          regionId: nextRegionId,
        },
      })
    }

    architectureStore.execute({
      type: 'COMPOSITE',
      operations,
    })
  }

  function handleRegionDrawStart(event: MouseEvent) {
    if (!options.regionToolActive.value) return

    const position = options.screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    regionDraft.value = {
      start: position,
      current: position,
    }

    window.addEventListener('mousemove', handleRegionMouseMove)
    window.addEventListener('mouseup', handleRegionMouseUp, { once: true })
  }

  function handleRegionMouseMove(event: MouseEvent) {
    if (!regionDraft.value) return

    const position = options.screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    regionDraft.value = {
      ...regionDraft.value,
      current: position,
    }
  }

  function handleRegionMouseUp() {
    window.removeEventListener('mousemove', handleRegionMouseMove)

    const draft = regionDraft.value
    regionDraft.value = null

    if (!draft) return

    const bounds = getRegionBounds(draft)

    if (bounds.width < 80 || bounds.height < 60) return

    const regionId = crypto.randomUUID()

    const enclosedNodes = architectureStore.architecture.nodes.filter((node) => {
      const width = node.size?.width ?? 204
      const height = node.size?.height ?? 88
      const centerX = node.position.x + width / 2
      const centerY = node.position.y + height / 2

      return (
        centerX >= bounds.x &&
        centerX <= bounds.x + bounds.width &&
        centerY >= bounds.y &&
        centerY <= bounds.y + bounds.height
      )
    })

    architectureStore.execute({
      type: 'COMPOSITE',
      operations: [
        {
          type: 'ADD_REGION',
          region: {
            id: regionId,
            name: 'Region',
            type: 'service-boundary',
            position: {
              x: bounds.x,
              y: bounds.y,
            },
            size: {
              width: bounds.width,
              height: bounds.height,
            },
          },
        },
        ...enclosedNodes.map((node) => ({
          type: 'UPDATE_NODE' as const,
          nodeId: node.id,
          changes: {
            regionId,
          },
        })),
      ],
    })

    options.regionToolActive.value = false
    options.onRegionCreated?.()
  }

  function cancelRegionDraft() {
    regionDraft.value = null
    window.removeEventListener('mousemove', handleRegionMouseMove)
  }

  return {
    regionDraft,
    getRegionBounds,
    findRegionForNode,
    resizeRegion,
    moveRegion,
    moveArchitectureNode,
    handleRegionDrawStart,
    cancelRegionDraft,
  }
}
