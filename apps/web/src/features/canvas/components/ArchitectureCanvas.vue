<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  VueFlow,
  type Node,
  type Edge,
  type Connection,
  useVueFlow,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'

import CanvasRegion from './CanvasRegion.vue'
import EdgeInspector from './EdgeInspector.vue'
import NodeInspector from './NodeInspector.vue'
import CanvasAnnotation from './CanvasAnnotation.vue'
import ArchitectureNode from '../nodes/ArchitectureNode.vue'
import type { NodeType } from '../../architectures/domain/node'
import CanvasToolRail, { type AddComponentPayload, } from './CanvasToolRail.vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()
const selectedEdgeId = ref<string | null>(null)
const selectedNodeId = ref<string | null>(null)

type RegionDraft = {
  start: {
    x: number
    y: number
  }

  current: {
    x: number
    y: number
  }
}

const regionToolActive = ref(false)
const regionDraft = ref<RegionDraft | null>(null)

function addComponent(
  payload: AddComponentPayload,
) {
  const typeNames: Record<NodeType, string> = {
    client: 'Client',
    service: 'Service',
    worker: 'Worker',
    database: 'Database',
    cache: 'Cache',
    queue: 'Queue',
    stream: 'Stream',
    'load-balancer': 'Load Balancer',
    gateway: 'Gateway',
    external: 'External System',
    storage: 'Storage',
    scheduler: 'Scheduler',
    custom: 'Component',
  }

  const technology =
    payload.technology

  const technologyNames: Record<
    string,
    string
  > = {
    PostgreSQL: 'PostgreSQL',
    MySQL: 'MySQL',
    MongoDB: 'MongoDB',
    DynamoDB: 'DynamoDB',
    Cassandra: 'Cassandra',

    RabbitMQ: 'RabbitMQ',
    Kafka: 'Kafka',
    SQS: 'SQS',
    'Pub / Sub': 'Pub / Sub',
    NATS: 'NATS',

    Redis: 'Redis',
    Memcached: 'Memcached',

    Browser: 'Client',
    'Mobile app': 'Mobile App',
    CLI: 'CLI',

    'Third-party API':
      'External API',

    SaaS: 'External SaaS',
    Partner: 'Partner System',

    Kong: 'Kong',
    Envoy: 'Envoy',
    Nginx: 'Nginx',

    ALB: 'Load Balancer',
    HAProxy: 'HAProxy',
  }

  const name =
    technology &&
      technologyNames[technology]
      ? technologyNames[technology]
      : typeNames[payload.type]

  const index = architectureStore.architecture.nodes.length

  architectureStore.execute({
    type: 'ADD_NODE',

    node: {
      id: crypto.randomUUID(),

      type: payload.type,

      name,

      position: {
        x: 260 + (index % 4) * 38,
        y: 180 + (index % 4) * 38,
      },

      metadata: {
        technology:
          technology?.toLowerCase(),
      },

      behavior: {},
    },
  })
}

const { screenToFlowCoordinate } = useVueFlow()

const toolRail = ref<InstanceType<typeof CanvasToolRail> | null>(null)

const annotationToolActive = ref(false)

const editingAnnotationId = ref<string | null>(null)

function handleNodeClick(event: { node: Node }) {
  if (event.node.data?.kind !== 'architecture') {
    selectedNodeId.value = null
    selectedEdgeId.value = null
    return
  }

  selectedNodeId.value = event.node.id
  selectedEdgeId.value = null
}

function handleEdgeClick(event: { edge: Edge }) {
  selectedEdgeId.value = event.edge.id
  selectedNodeId.value = null
}

function handlePaneClick(event: MouseEvent) {
  if (regionToolActive.value) {
    return
  }
  selectedNodeId.value = null
  selectedEdgeId.value = null

  if (!annotationToolActive.value) {
    return
  }

  const position =
    screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })

  const id = crypto.randomUUID()

  architectureStore.execute({
    type: 'ADD_ANNOTATION',

    annotation: {
      id,
      text: 'Annotation',
      kind: 'note',
      position: {
        x: position.x,
        y: position.y,
      },
    },
  })

  editingAnnotationId.value = id

  annotationToolActive.value = false

  toolRail.value?.deactivateAnnotation()
}

function updateAnnotation(annotationId: string, text: string,) {
  const annotation =
    architectureStore.architecture
      .annotations.find(
        (item) =>
          item.id === annotationId,
      )

  if (!annotation) {
    return
  }

  if (annotation.text === text) {
    editingAnnotationId.value = null
    return
  }

  architectureStore.execute({
    type: 'UPDATE_ANNOTATION',
    annotationId,
    changes: {
      text,
    },
  })

  editingAnnotationId.value = null
}


const nodes = computed<Node[]>(() => {
  const architectureNodes =
    architectureStore.architecture.nodes.map(
      (node): Node => ({
        id: node.id,

        position: node.position,

        data: {
          label: node.name,
          nodeType: node.type,
          technology:
            node.metadata.technology,

          instances:
            node.metadata.instances,

          timeoutMs:
            node.behavior.timeoutMs,

          properties:
            node.metadata.properties,

          kind: 'architecture',
        },

        type: 'architecture',
      }),
    )

  const annotationNodes =
    architectureStore.architecture.annotations.map(
      (annotation): Node => ({
        id: annotation.id,

        position:
          annotation.position,

        data: {
          text: annotation.text,

          editing:
            editingAnnotationId.value ===
            annotation.id,

          kind: 'annotation',
        },

        type: 'annotation',

        selectable: true,
      }),
    )

  const regionNodes = architectureStore.architecture
    .regions.map(
      (region): Node => ({
        id: `region:${region.id}`,

        position: region.position,

        type: 'region',

        draggable: true,
        selectable: true,
        connectable: false,

        zIndex: -10,

        style: {
          width:
            `${region.size.width}px`,

          height:
            `${region.size.height}px`,
        },

        data: {
          regionId: region.id,
          label: region.name,
          kind: 'region',
          draft: false,
        },
      }),
    )

  const draftRegionNodes: Node[] = []

  if (regionDraft.value) {
    const bounds =
      getRegionBounds(
        regionDraft.value,
      )

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
        width:
          `${bounds.width}px`,

        height:
          `${bounds.height}px`,
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
  ]
})

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
  if (event.node.data?.kind === 'annotation') {
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

  if (event.node.data?.kind !== 'architecture') {
    return
  }

  architectureStore.execute({
    type: 'MOVE_NODE',
    nodeId: event.node.id,

    position: {
      x: event.node.position.x,
      y: event.node.position.y,
    },
  })
}

function handleNodeDoubleClick(event: { node: Node }) {
  if (event.node.data?.kind !== 'annotation') {
    return
  }

  editingAnnotationId.value =
    event.node.id

  selectedNodeId.value = null
  selectedEdgeId.value = null
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

function handleAnnotationTool() {
  annotationToolActive.value = !annotationToolActive.value

  selectedNodeId.value = null
  selectedEdgeId.value = null
  regionToolActive.value = false
}

function getRegionBounds(draft: RegionDraft) {
  const x = Math.min(
    draft.start.x,
    draft.current.x,
  )

  const y = Math.min(
    draft.start.y,
    draft.current.y,
  )

  const width = Math.abs(
    draft.current.x -
    draft.start.x,
  )

  const height = Math.abs(
    draft.current.y -
    draft.start.y,
  )

  return {
    x,
    y,
    width,
    height,
  }
}

function handleRegionTool() {
  regionToolActive.value = !regionToolActive.value

  annotationToolActive.value = false

  selectedNodeId.value = null
  selectedEdgeId.value = null
}

function handleRegionDrawStart(event: MouseEvent) {
  if (!regionToolActive.value) {
    return
  }

  const position =
    screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

  regionDraft.value = {
    start: position,
    current: position,
  }

  window.addEventListener(
    'mousemove',
    handleRegionMouseMove,
  )

  window.addEventListener(
    'mouseup',
    handleRegionMouseUp,
    { once: true },
  )
}

function handleRegionMouseMove(event: MouseEvent) {
  if (!regionDraft.value) {
    return
  }

  const position =
    screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

  regionDraft.value = {
    ...regionDraft.value,
    current: position,
  }
}

function handleRegionMouseUp() {
  window.removeEventListener(
    'mousemove',
    handleRegionMouseMove,
  )

  const draft =
    regionDraft.value

  regionDraft.value = null

  if (!draft) {
    return
  }

  const bounds =
    getRegionBounds(draft)

  if (
    bounds.width < 80 ||
    bounds.height < 60
  ) {
    return
  }

  const regionId =
    crypto.randomUUID()

  const enclosedNodes =
    architectureStore.architecture
      .nodes.filter((node) => {
        const width =
          node.size?.width ?? 204

        const height =
          node.size?.height ?? 88

        const centerX =
          node.position.x +
          width / 2

        const centerY =
          node.position.y +
          height / 2

        return (
          centerX >= bounds.x &&
          centerX <=
          bounds.x + bounds.width &&
          centerY >= bounds.y &&
          centerY <=
          bounds.y + bounds.height
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

      ...enclosedNodes.map(
        (node) => ({
          type: 'UPDATE_NODE' as const,

          nodeId: node.id,

          changes: {
            regionId,
          },
        }),
      ),
    ],
  })

  regionToolActive.value = false

  toolRail.value?.deactivateRegion()
}
</script>

<template>
  <div class="architecture-canvas">
    <VueFlow :nodes="nodes" :edges="edges" :fit-view-on-init="true" @node-drag-stop="handleNodeDragStop"
      @connect="handleConnect" @edge-click="handleEdgeClick" @pane-click="handlePaneClick" @node-click="handleNodeClick"
      @node-double-click="handleNodeDoubleClick">
      <template #node-architecture="nodeProps">
        <ArchitectureNode :data="nodeProps.data" :selected="selectedNodeId === nodeProps.id" />
      </template>

      <template #node-annotation="nodeProps">
        <CanvasAnnotation :data="nodeProps.data" @commit="
          updateAnnotation(nodeProps.id, $event)" />
      </template>

      <template #node-region="nodeProps">
        <CanvasRegion :data="nodeProps.data" />
      </template>

      <Background />
      <Controls />
    </VueFlow>

    <div v-if="regionToolActive" class="region-draw-layer" @mousedown.stop.prevent="handleRegionDrawStart" />

    <CanvasToolRail ref="toolRail" @add-component="addComponent" @annotation-tool="handleAnnotationTool"
      @region-tool="handleRegionTool" />
    <!-- <NodePalette @add="addNode" /> -->
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

.region-draw-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  cursor: crosshair;
  background: transparent;
}
</style>