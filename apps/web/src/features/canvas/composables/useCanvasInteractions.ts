import type { Connection, Node } from '@vue-flow/core'
import type { Ref } from 'vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type Options = {
    editingAnnotationId: Ref<string | null>
    selectedAnnotationId: Ref<string | null>
    clearSelection: () => void
    moveRegion: (node: Node) => void
    moveArchitectureNode: (node: Node) => void
}

export function useCanvasInteractions(options: Options) {
    const architectureStore = useArchitectureStore()

    function updateAnnotation(annotationId: string, text: string) {
        const annotation = architectureStore.architecture.annotations.find((item) => item.id === annotationId)
        if (!annotation) return

        if (annotation.text === text) {
            options.editingAnnotationId.value = null
            return
        }

        architectureStore.execute({
            type: 'UPDATE_ANNOTATION',
            annotationId,
            changes: { text },
        })

        options.editingAnnotationId.value = null
    }

    function handleNodeDragStop(event: { node: Node }) {
        const kind = event.node.data?.kind

        if (kind === 'annotation') {
            architectureStore.execute({
                type: 'UPDATE_ANNOTATION',
                annotationId: event.node.id,
                changes: {
                    position: {
                        x: event.node.position.x,
                        y: event.node.position.y,
                    },
                },
            })

            return
        }

        if (kind === 'region') {
            options.moveRegion(event.node)
            return
        }

        if (kind === 'architecture') {
            options.moveArchitectureNode(event.node)
        }
    }

    function handleNodeDoubleClick(event: { node: Node }) {
        if (event.node.data?.kind !== 'annotation') return

        options.clearSelection()
        options.selectedAnnotationId.value = event.node.id
        options.editingAnnotationId.value = event.node.id
    }

    function handleConnect(connection: Connection) {
        if (!connection.source || !connection.target) return
        if (connection.source === connection.target) return

        architectureStore.execute({
            type: 'ADD_EDGE',
            edge: {
                id: crypto.randomUUID(),
                source: {
                    nodeId: connection.source,
                    portId: connection.sourceHandle ?? undefined,
                },
                target: {
                    nodeId: connection.target,
                    portId: connection.targetHandle ?? undefined,
                },
                type: 'sync',
                protocol: 'http',
                behavior: {},
            },
        })
    }

    function resizeNode(nodeId: string, size: { width: number; height: number }) {
        architectureStore.execute({
            type: 'RESIZE_NODE',
            nodeId,
            size,
        })
    }

    return {
        updateAnnotation,
        handleNodeDragStop,
        handleNodeDoubleClick,
        handleConnect,
        resizeNode,
    }
}
