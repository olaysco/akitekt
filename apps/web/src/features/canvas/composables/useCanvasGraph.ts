import { computed, type Ref } from 'vue'
import { MarkerType } from '@vue-flow/core'
import type { Edge, Node } from '@vue-flow/core'
import type { AddComponentPayload } from '../components/CanvasToolRail.vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store.ts'
import { useSimulationStore } from '../../simulation/stores/simulation.store'

type RegionDraft = {
    start: { x: number; y: number }
    current: { x: number; y: number }
}

type Options = {
    pendingComponent: Ref<AddComponentPayload | null>
    placementPosition: Ref<{ x: number; y: number } | null>
    editingAnnotationId: Ref<string | null>
    selectedEdgeId: Ref<string | null>
    regionDraft: Ref<RegionDraft | null>
    getComponentName: (payload: AddComponentPayload) => string
    getRegionBounds: (draft: RegionDraft) => { x: number; y: number; width: number; height: number }
}

const statusStroke: Record<string, string> = {
    ok: 'oklch(0.58 0.15 152)',
    warn: 'oklch(0.68 0.16 68)',
    fail: 'oklch(0.58 0.21 27)',
}

export function useCanvasGraph(options: Options) {
    const architectureStore = useArchitectureStore()
    const simulationStore = useSimulationStore()

    const nodes = computed<Node[]>(() => {
        const architectureNodes = architectureStore.architecture.nodes.map((node): Node => ({
            id: node.id,
            position: node.position,
            class: simulationStore.nodeStatus[node.id]
                ? `node-status-${simulationStore.nodeStatus[node.id]}`
                : undefined,
            style: node.size ? {
                width: `${node.size.width}px`,
                height: `${node.size.height}px`,
            } : undefined,
            data: {
                label: node.name,
                nodeType: node.type,
                technology: node.metadata.technology,
                instances: node.metadata.instances,
                timeoutMs: node.behavior.timeoutMs,
                properties: node.metadata.properties,
                kind: 'architecture',
            },
            type: 'architecture',
        }))

        const annotationNodes = architectureStore.architecture.annotations.map((annotation): Node => ({
            id: annotation.id,
            position: annotation.position,
            data: {
                text: annotation.text,
                editing: options.editingAnnotationId.value === annotation.id,
                kind: 'annotation',
            },
            type: 'annotation',
            selectable: true,
        }))

        const regionNodes = architectureStore.architecture.regions.map((region): Node => ({
            id: `region:${region.id}`,
            position: region.position,
            type: 'region',
            draggable: true,
            selectable: true,
            connectable: false,
            zIndex: -10,
            style: {
                width: `${region.size.width}px`,
                height: `${region.size.height}px`,
            },
            data: {
                regionId: region.id,
                label: region.name,
                kind: 'region',
                draft: false,
            },
        }))

        const draftRegionNodes: Node[] = []
        const placementNodes: Node[] = []

        if (options.pendingComponent.value && options.placementPosition.value) {
            const component = options.pendingComponent.value

            placementNodes.push({
                id: '__component-placement__',
                type: 'architecture',
                position: {
                    x: options.placementPosition.value.x - 102,
                    y: options.placementPosition.value.y - 44,
                },
                draggable: false,
                selectable: false,
                connectable: false,
                zIndex: 50,
                data: {
                    label: options.getComponentName(component),
                    nodeType: component.type,
                    technology: component.technology,
                    kind: 'placement-preview',
                },
                class: 'component-placement-preview',
            })
        }

        if (options.regionDraft.value) {
            const bounds = options.getRegionBounds(options.regionDraft.value)

            draftRegionNodes.push({
                id: '__region-draft__',
                position: {
                    x: bounds.x,
                    y: bounds.y,
                },
                type: 'region',
                draggable: false,
                selectable: false,
                connectable: false,
                zIndex: -9,
                style: {
                    width: `${bounds.width}px`,
                    height: `${bounds.height}px`,
                },
                data: {
                    label: 'Region',
                    kind: 'region',
                    draft: true,
                },
            })
        }

        return [
            ...regionNodes,
            ...draftRegionNodes,
            ...architectureNodes,
            ...annotationNodes,
            ...placementNodes,
        ]
    })

    const edges = computed<Edge[]>(() =>
        architectureStore.architecture.edges.map((edge) => {
            const selected = options.selectedEdgeId.value === edge.id
            const dashed = edge.type === 'async' || edge.type === 'event' || edge.type === 'stream'
            const status = simulationStore.edgeStatus[edge.id]
            const stroke = status
                ? statusStroke[status]
                : selected
                    ? 'oklch(0.60 0.19 258)'
                    : 'oklch(0.70 0.012 258)'

            return {
                id: edge.id,
                source: edge.source.nodeId,
                target: edge.target.nodeId,
                label: edge.label,
                data: {
                    edgeType: edge.type,
                    protocol: edge.protocol,
                },
                animated: status !== undefined && simulationStore.running,
                style: {
                    stroke,
                    strokeWidth: status || selected ? 2 : 1.4,
                    strokeDasharray: dashed ? '5 4' : undefined,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 7,
                    height: 7,
                    color: stroke,
                },
            }
        }),
    )

    const isArchitectureEmpty = computed(() =>
        architectureStore.architecture.nodes.length === 0 &&
        architectureStore.architecture.edges.length === 0 &&
        architectureStore.architecture.regions.length === 0 &&
        architectureStore.architecture.annotations.length === 0,
    )

    return {
        nodes,
        edges,
        isArchitectureEmpty,
    }
}
