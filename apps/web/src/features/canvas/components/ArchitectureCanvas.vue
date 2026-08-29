<script setup lang="ts">
import { computed } from 'vue'
import { VueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'

import ArchitectureNode from '../nodes/ArchitectureNode.vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()

const nodes = computed<Node[]>(() =>
  architectureStore.architecture.nodes.map((node) => ({
    id: node.id,
    position: node.position,

    data: {
      label: node.name,
      nodeType: node.type,
      technology: node.metadata.technology,
    },

    type: 'architecture',
  })),
)

const edges = computed<Edge[]>(() =>
  architectureStore.architecture.edges.map((edge) => ({
    id: edge.id,
    source: edge.source.nodeId,
    target: edge.target.nodeId,

    label: edge.label,

    data: {
      edgeType: edge.type,
      protocol: edge.protocol,
    },
  })),
)

function handleNodeDragStop(event: { node: Node }) {
  architectureStore.execute({
    type: 'MOVE_NODE',
    nodeId: event.node.id,
    position: {
      x: event.node.position.x,
      y: event.node.position.y,
    },
  })
}
</script>

<template>
  <div class="architecture-canvas">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :fit-view-on-init="true"
      @node-drag-stop="handleNodeDragStop"
    >
      <template #node-architecture="nodeProps">
        <ArchitectureNode
          :data="nodeProps.data"
        />
      </template>
      <Background />

      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.architecture-canvas {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>
