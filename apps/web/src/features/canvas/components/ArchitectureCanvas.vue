<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  VueFlow,
  type Node,
  type Edge,
  type Connection,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'

import NodePalette from './NodePalette.vue'
import EdgeInspector from './EdgeInspector.vue'
import NodeInspector from './NodeInspector.vue'
import type { NodeType } from '../../architectures/domain/node'
import ArchitectureNode from '../nodes/ArchitectureNode.vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()

const selectedEdgeId = ref<string | null>(null)

const selectedNodeId = ref<string | null>(null)

function handleNodeClick(event: { node: Node }) {
  selectedNodeId.value = event.node.id
  selectedEdgeId.value = null
}

function handleEdgeClick(event: { edge: Edge }) {
  selectedEdgeId.value = event.edge.id
  selectedNodeId.value = null
}

function handlePaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

const nodes = computed<Node[]>(() =>
  architectureStore.architecture.nodes.map((node) => ({
    id: node.id,

    position: node.position,

    data: {
      label: node.name,
      nodeType: node.type,
      technology: node.metadata.technology,

      instances: node.metadata.instances,
      timeoutMs: node.behavior.timeoutMs,

      properties: node.metadata.properties,
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

function handleConnect(connection: Connection) {
  if (!connection.source || !connection.target) {
    return
  }

  if (connection.source === connection.target) {
    return
  }

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

function addNode(type: NodeType) {
  const defaults: Record<
    NodeType,
    {
      name: string
      technology?: string
    }
  > = {
    client: {
      name: 'Client',
    },

    service: {
      name: 'Service',
    },

    worker: {
      name: 'Worker',
    },

    database: {
      name: 'Database',
    },

    cache: {
      name: 'Cache',
    },

    queue: {
      name: 'Queue',
    },

    stream: {
      name: 'Stream',
    },

    'load-balancer': {
      name: 'Load Balancer',
    },

    gateway: {
      name: 'API Gateway',
    },

    external: {
      name: 'External System',
    },

    storage: {
      name: 'Storage',
    },

    scheduler: {
      name: 'Scheduler',
    },

    custom: {
      name: 'Component',
    },
  }

  const definition = defaults[type]

  architectureStore.execute({
    type: 'ADD_NODE',

    node: {
      id: crypto.randomUUID(),

      type,

      name: definition.name,

      position: {
        x: 320 + architectureStore.architecture.nodes.length * 30,
        y: 180 + architectureStore.architecture.nodes.length * 30,
      },

      metadata: {
        technology: definition.technology,
      },

      behavior: {},
    },
  })
}

</script>

<template>
  <div class="architecture-canvas">
    <VueFlow :nodes="nodes" :edges="edges" :fit-view-on-init="true" @node-drag-stop="handleNodeDragStop"
      @connect="handleConnect" @edge-click="handleEdgeClick" @pane-click="handlePaneClick"
      @node-click="handleNodeClick">
      <template #node-architecture="nodeProps">
        <ArchitectureNode :data="nodeProps.data" :selected="selectedNodeId === nodeProps.id" />
      </template>

      <Background />
      <Controls />
    </VueFlow>

    <NodePalette @add="addNode" />
    <EdgeInspector :edge-id="selectedEdgeId" />
    <NodeInspector :node-id="selectedNodeId" />
  </div>
</template>

<style scoped>
.architecture-canvas {
  position: relative;

  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>