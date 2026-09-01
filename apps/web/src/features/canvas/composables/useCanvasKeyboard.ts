import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import type { DocumentOperation } from '../../architectures/domain/operation'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type Options = {
    selectedNodeId: Ref<string | null>
    selectedNodeIds: Ref<string[]>
    selectedEdgeId: Ref<string | null>
    selectedRegionId: Ref<string | null>
    selectedAnnotationId: Ref<string | null>
    editingAnnotationId: Ref<string | null>
    clearSelection: () => void
    cancelTransientTools: () => void
}

export function useCanvasKeyboard(options: Options) {
    const architectureStore = useArchitectureStore()

    function deleteSelectedNodes() {
        if (options.selectedNodeIds.value.length === 0) return

        const operations: DocumentOperation[] = options.selectedNodeIds.value.map((nodeId) => ({
            type: 'REMOVE_NODE',
            nodeId,
        }))

        architectureStore.execute({
            type: 'COMPOSITE',
            operations,
        })

        options.selectedNodeIds.value = []
        options.selectedNodeId.value = null
    }

    function deleteSelection() {
        if (options.selectedAnnotationId.value) {
            architectureStore.execute({
                type: 'REMOVE_ANNOTATION',
                annotationId: options.selectedAnnotationId.value,
            })

            options.editingAnnotationId.value = null
            options.clearSelection()
            return
        }

        if (options.selectedEdgeId.value) {
            architectureStore.execute({
                type: 'REMOVE_EDGE',
                edgeId: options.selectedEdgeId.value,
            })

            options.clearSelection()
            return
        }

        if (options.selectedRegionId.value) {
            architectureStore.execute({
                type: 'REMOVE_REGION',
                regionId: options.selectedRegionId.value,
            })

            options.clearSelection()
            return
        }

        deleteSelectedNodes()
    }

    function duplicateSelectedNodes() {
        if (options.selectedNodeIds.value.length === 0) return

        const sourceNodes = architectureStore.architecture.nodes.filter((node) => options.selectedNodeIds.value.includes(node.id))
        const idMap = new Map<string, string>()
        const offset = 32

        const addNodeOperations: DocumentOperation[] = sourceNodes.map((node) => {
            const newId = crypto.randomUUID()
            idMap.set(node.id, newId)

            return {
                type: 'ADD_NODE',
                node: {
                    ...node,
                    id: newId,
                    position: {
                        x: node.position.x + offset,
                        y: node.position.y + offset,
                    },
                },
            }
        })

        const internalEdges = architectureStore.architecture.edges.filter((edge) =>
            idMap.has(edge.source.nodeId) && idMap.has(edge.target.nodeId),
        )

        const addEdgeOperations: DocumentOperation[] = internalEdges.map((edge) => ({
            type: 'ADD_EDGE',
            edge: {
                ...edge,
                id: crypto.randomUUID(),
                source: {
                    ...edge.source,
                    nodeId: idMap.get(edge.source.nodeId)!,
                },
                target: {
                    ...edge.target,
                    nodeId: idMap.get(edge.target.nodeId)!,
                },
            },
        }))

        architectureStore.execute({
            type: 'COMPOSITE',
            operations: [...addNodeOperations, ...addEdgeOperations],
        })

        options.selectedNodeIds.value = Array.from(idMap.values())
        options.selectedNodeId.value = options.selectedNodeIds.value.length === 1 ? options.selectedNodeIds.value[0] : null
    }

    function handleKeyDown(event: KeyboardEvent) {
        const isModifier = event.metaKey || event.ctrlKey
        const target = event.target as HTMLElement | null
        const isEditing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

        if (isModifier && event.key.toLowerCase() === 'z' && !isEditing) {
            event.preventDefault()
            event.shiftKey ? architectureStore.redo() : architectureStore.undo()
            return
        }

        if (event.key === 'Escape') {
            options.clearSelection()
            options.cancelTransientTools()
            return
        }

        if (isModifier && event.key.toLowerCase() === 'd' && !isEditing) {
            if (options.selectedNodeIds.value.length === 0) return

            event.preventDefault()
            duplicateSelectedNodes()
            return
        }

        if (event.key !== 'Delete' && event.key !== 'Backspace') return
        if (isEditing) return

        const hasSelection =
            options.selectedNodeIds.value.length > 0 ||
            options.selectedEdgeId.value !== null ||
            options.selectedRegionId.value !== null ||
            options.selectedAnnotationId.value !== null

        if (!hasSelection) return

        event.preventDefault()
        deleteSelection()
    }

    onMounted(() => window.addEventListener('keydown', handleKeyDown))
    onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown))

    return {
        deleteSelection,
        duplicateSelectedNodes,
    }
}
