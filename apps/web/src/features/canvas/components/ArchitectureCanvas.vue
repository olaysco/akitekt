<script setup lang="ts">
import { ref } from 'vue'
import {
  VueFlow,
  useVueFlow,
} from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'


import CanvasRegion from './CanvasRegion.vue'
import CanvasToolRail from './CanvasToolRail.vue'
import CanvasAnnotation from './CanvasAnnotation.vue'
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

const regionToolActive = ref(false)
const { screenToFlowCoordinate } = useVueFlow()
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

const { deleteSelection } = useCanvasKeyboard({
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
</script>

<template>
  <div class="architecture-canvas">
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

    <button class="temporary-delete" @click="deleteSelection">Delete selected</button>

    <CanvasToolRail ref="toolRail" @add-component="selectComponent" @annotation-tool="handleAnnotationTool"
      @region-tool="handleRegionTool" />

    <ContextualSidePanel v-if="hasContextualSelection" :selected-node-id="selectedNodeId"
      :selected-node-ids="selectedNodeIds" :selected-edge-id="selectedEdgeId" :selected-region-id="selectedRegionId" />

    <WorkspaceSidePanel v-else />

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