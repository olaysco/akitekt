<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import {
  VueFlow,
  useVueFlow,
} from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'


import CanvasRegion from './CanvasRegion.vue'
import CanvasToolRail from './CanvasToolRail.vue'
import CanvasAnnotation from './CanvasAnnotation.vue'
import CanvasStatusBar from './CanvasStatusBar.vue'
import WorkspaceSidePanel from './WorkspaceSidePanel.vue'
import ContextualSidePanel from './ContextualSidePanel.vue'
import ArchitectureNode from '../nodes/ArchitectureNode.vue'
import { useCanvasTools } from '../composables/useCanvasTools'
import { useCanvasGraph } from '../composables/useCanvasGraph'
import { useCanvasRegions } from '../composables/useCanvasRegions'
import EmptyArchitectureCanvas from './EmptyArchitectureCanvas.vue'
import { useCanvasKeyboard } from '../composables/useCanvasKeyboard'
import { useCanvasInteractions } from '../composables/useCanvasInteractions'
import { useCanvasSelection } from '../../canvas/composables/useCanvasSelection'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()
const canvasEl = ref<HTMLElement | null>(null)
const regionToolActive = ref(false)
const { fitView, viewport, getViewport, setViewport, screenToFlowCoordinate } = useVueFlow()
const editingAnnotationId = ref<string | null>(null)
const toolRail = ref<InstanceType<typeof CanvasToolRail> | null>(null)

const {
  regionDraft,
  moveRegion,
  resizeRegion,
  getRegionBounds,
  moveArchitectureNode,
  handleRegionDrawStart,
  cancelRegionDraft,
} = useCanvasRegions({
  regionToolActive,
  screenToFlowCoordinate,
  onRegionCreated: () => toolRail.value?.deactivateRegion(),
})

const {
  selectedEdgeId,
  selectedNodeId,
  selectedNodeIds,
  selectedRegionId,
  selectedAnnotationId,
  hasContextualSelection,
  clearSelection,
  handleNodeClick,
  handleEdgeClick,
} = useCanvasSelection()

useCanvasKeyboard({
  selectedNodeId,
  selectedNodeIds,
  selectedEdgeId,
  selectedRegionId,
  selectedAnnotationId,
  editingAnnotationId,
  clearSelection,
  cancelTransientTools,
})

const {
  pendingComponent,
  placementPosition,
  annotationToolActive,
  getComponentName,
  selectComponent,
  handleAnnotationTool,
  handlePaneClick,
  handleCanvasMouseMove,
  handleComponentMouseDown,
  cancelTools,
} = useCanvasTools({
  screenToFlowCoordinate,
  regionToolActive,
  editingAnnotationId,
  clearSelection,
  deactivateAnnotation: () => toolRail.value?.deactivateAnnotation(),
  deactivateRegion: () => toolRail.value?.deactivateRegion(),
})

const {
  nodes,
  edges,
  isArchitectureEmpty,
} = useCanvasGraph({
  pendingComponent,
  placementPosition,
  editingAnnotationId,
  selectedEdgeId,
  regionDraft,
  getComponentName,
  getRegionBounds,
})

const {
  updateAnnotation,
  handleNodeDragStop,
  handleNodeDoubleClick,
  handleConnect,
  resizeNode,
} = useCanvasInteractions({
  editingAnnotationId,
  selectedAnnotationId,
  clearSelection,
  moveRegion,
  moveArchitectureNode,
})

function handleRegionTool() {
  pendingComponent.value = null
  placementPosition.value = null
  annotationToolActive.value = false
  regionToolActive.value = !regionToolActive.value

  clearSelection()
  toolRail.value?.deactivateAnnotation()
}

function cancelTransientTools() {
  cancelTools()
  cancelRegionDraft()
}

const sidePanelWidth = 358

async function fitCanvas(nodeIds?: string[]) {
  await fitView(
    nodeIds ? { nodes: nodeIds, padding: 0.18 } : { padding: 0.18 },
  )

  await nextTick()

  const element = canvasEl.value

  if (!element) {
    return
  }

  const width = element.clientWidth
  const height = element.clientHeight
  const scale = (width - sidePanelWidth) / width
  const fitted = getViewport()

  setViewport({
    zoom: fitted.zoom * scale,
    x: fitted.x * scale,
    y: (fitted.y - height / 2) * scale + height / 2,
  })
}

watch(
  () => architectureStore.compareDocumentId,
  async () => {
    await nextTick()

    setTimeout(fitCanvas, 60)
  },
)

async function focusPatternNodes(nodeIds: string[]) {
  await nextTick()
  await fitCanvas(nodeIds)
}
</script>

<template>
  <div ref="canvasEl" class="architecture-canvas">
    <VueFlow :nodes="nodes" :edges="edges" :fit-view-on-init="true" @node-drag-stop="handleNodeDragStop"
      @connect="handleConnect" @edge-click="handleEdgeClick" @pane-click="handlePaneClick" @node-click="handleNodeClick"
      @node-double-click="handleNodeDoubleClick" :class="{ 'component-placement': pendingComponent !== null }">
      <template #node-architecture="nodeProps">
        <ArchitectureNode :data="nodeProps.data" :selected="selectedNodeIds.includes(nodeProps.id)"
          @resize-end="resizeNode(nodeProps.id, $event)" />
      </template>

      <template #node-annotation="nodeProps">
        <CanvasAnnotation :data="nodeProps.data" :selected="selectedAnnotationId === nodeProps.id"
          @commit="updateAnnotation(nodeProps.id, $event)" />
      </template>

      <template #node-region="nodeProps">
        <CanvasRegion :data="nodeProps.data" :selected="selectedRegionId ===
          nodeProps.data.regionId
          " @resize-end="
            resizeRegion(
              nodeProps.data.regionId,
              $event,
            )
            " />
      </template>

      <Background :gap="20" :size="1" />
      <Controls />
    </VueFlow>

    <EmptyArchitectureCanvas v-if="isArchitectureEmpty" />

    <div v-if="pendingComponent" class="component-placement-layer" @mousemove="handleCanvasMouseMove"
      @mousedown.stop.prevent="handleComponentMouseDown" />

    <div v-if="regionToolActive" class="region-draw-layer" @mousedown.stop.prevent="handleRegionDrawStart" />

    <CanvasStatusBar :zoom="viewport.zoom" @fit="fitCanvas()" />

    <CanvasToolRail ref="toolRail" @add-component="selectComponent" @annotation-tool="handleAnnotationTool"
      @region-tool="handleRegionTool" />

    <ContextualSidePanel v-if="hasContextualSelection" :selected-node-id="selectedNodeId"
      :selected-node-ids="selectedNodeIds" :selected-edge-id="selectedEdgeId" :selected-region-id="selectedRegionId" />

    <WorkspaceSidePanel v-else @focus-nodes="focusPatternNodes" />

  </div>
</template>

<style scoped>
.architecture-canvas {
  position: relative;
  width: 100%;
  height: 100%;

  background: oklch(0.98 0.004 258);
  overflow: hidden;
}

.architecture-canvas :deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

.architecture-canvas :deep(.compare-node) {
  opacity: 0.72;
}

.architecture-canvas :deep(.compare-node .architecture-node) {
  cursor: default;
  box-shadow: none;
}

.architecture-canvas :deep(.node-status-ok .architecture-node) {
  border-color: oklch(0.58 0.15 152);
  box-shadow: 0 0 0 3px oklch(0.58 0.15 152 / 0.14);
}

.architecture-canvas :deep(.node-status-warn .architecture-node) {
  border-color: oklch(0.68 0.16 68);
  box-shadow: 0 0 0 3px oklch(0.68 0.16 68 / 0.14);
}

.architecture-canvas :deep(.node-status-fail .architecture-node) {
  border-color: oklch(0.58 0.21 27);
  box-shadow: 0 0 0 3px oklch(0.58 0.21 27 / 0.16);
}

.region-draw-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  cursor: crosshair;
  background: transparent;
}

:deep(.component-placement .vue-flow__pane) {
  cursor: crosshair;
}

:deep(.component-placement-preview) {
  opacity: 0.55;
  pointer-events: none;
}

.component-placement-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  cursor: crosshair;
  background: transparent;
}

.selection-title {
  font-weight: 600;
}

.selection-hint {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}
</style>
