import { computed, ref } from 'vue'
import type { Edge, NodeMouseEvent } from '@vue-flow/core'

export function useCanvasSelection() {
    const selectedNodeIds = ref<string[]>([])
    const selectedEdgeId = ref<string | null>(null)
    const selectedNodeId = ref<string | null>(null)
    const selectedRegionId = ref<string | null>(null)
    const selectedAnnotationId = ref<string | null>(null)

    const hasMultiNodeSelection = computed(() => selectedNodeIds.value.length > 1)
    const hasSingleNodeSelection = computed(() => selectedNodeIds.value.length === 1 && selectedNodeId.value !== null)

    const hasContextualSelection = computed(() =>
        hasSingleNodeSelection.value ||
        selectedEdgeId.value !== null ||
        selectedRegionId.value !== null ||
        hasMultiNodeSelection.value,
    )

    function clearSelection() {
        selectedNodeIds.value = []
        selectedNodeId.value = null
        selectedEdgeId.value = null
        selectedRegionId.value = null
        selectedAnnotationId.value = null
    }

    function handleNodeClick(event: NodeMouseEvent) {
        const kind = event.node.data?.kind

        if (kind === 'architecture') {
            const nodeId = event.node.id
            const isShiftClick = 'shiftKey' in event.event && event.event.shiftKey

            selectedEdgeId.value = null
            selectedRegionId.value = null
            selectedAnnotationId.value = null

            if (isShiftClick) {
                selectedNodeIds.value = selectedNodeIds.value.includes(nodeId)
                    ? selectedNodeIds.value.filter((id) => id !== nodeId)
                    : [...selectedNodeIds.value, nodeId]
            } else {
                selectedNodeIds.value = [nodeId]
            }

            selectedNodeId.value = selectedNodeIds.value.length === 1 ? selectedNodeIds.value[0] : null
            return
        }

        if (kind === 'annotation') {
            clearSelection()
            selectedAnnotationId.value = event.node.id
            return
        }

        if (kind === 'region') {
            clearSelection()
            selectedRegionId.value = event.node.data?.regionId ?? null
        }
    }

    function handleEdgeClick(event: { edge: Edge }) {
        clearSelection()
        selectedEdgeId.value = event.edge.id
    }

    return {
        selectedEdgeId,
        selectedNodeId,
        selectedNodeIds,
        selectedRegionId,
        selectedAnnotationId,
        hasSingleNodeSelection,
        hasMultiNodeSelection,
        hasContextualSelection,
        clearSelection,
        handleNodeClick,
        handleEdgeClick,
    }
}
