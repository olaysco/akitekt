<script setup lang="ts">
import { computed } from 'vue'

import type {
    EdgeType,
    Protocol,
} from '../../architectures/domain/edge'

import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type Props = {
    edgeId: string | null
}

const props = defineProps<Props>()

const architectureStore = useArchitectureStore()

const sourceNode = computed(() => architectureStore.architecture.nodes.find(
    (node) =>
      node.id === edge.value?.source.nodeId,
  ),
)

const targetNode = computed(() => architectureStore.architecture.nodes.find(
    (node) =>
      node.id === edge.value?.target.nodeId,
  ),
)

const edge = computed(() =>
    architectureStore.architecture.edges.find(
        (item) => item.id === props.edgeId,
    ),
)

function updateType(type: EdgeType) {
    if (!edge.value) {
        return
    }

    architectureStore.execute({
        type: 'UPDATE_EDGE',

        edgeId: edge.value.id,

        changes: {
            type,
        },
    })
}

function updateProtocol(protocol: Protocol) {
    if (!edge.value) {
        return
    }

    architectureStore.execute({
        type: 'UPDATE_EDGE',

        edgeId: edge.value.id,

        changes: {
            protocol,
        },
    })
}

function updateLabel(label: string) {
    if (!edge.value) {
        return
    }

    architectureStore.execute({
        type: 'UPDATE_EDGE',

        edgeId: edge.value.id,

        changes: {
            label,
        },
    })
}

function removeEdge() {
    if (!edge.value) {
        return
    }

    architectureStore.execute({
        type: 'REMOVE_EDGE',
        edgeId: edge.value.id,
    })
}
</script>

<template>
    <aside v-if="edge" class="edge-inspector">
        <div class="header">
            <div>
                <div class="eyebrow">
                    Connection
                </div>

                <div class="connection-route">
                    {{ sourceNode?.name ?? 'Unknown' }}
                    →
                    {{ targetNode?.name ?? 'Unknown' }}
                </div>
            </div>
        </div>

        <label class="field">
            <span>Label</span>

            <input :value="edge.label ?? ''" placeholder="e.g. Provision DNS" @change="
                updateLabel(
                    ($event.target as HTMLInputElement).value,
                )
                " />
        </label>

        <label class="field">
            <span>Type</span>

            <select :value="edge.type" @change="
                updateType(
                    ($event.target as HTMLSelectElement)
                        .value as EdgeType,
                )
                ">
                <option value="sync">
                    Synchronous
                </option>

                <option value="async">
                    Asynchronous
                </option>

                <option value="event">
                    Event
                </option>

                <option value="query">
                    Query
                </option>

                <option value="replication">
                    Replication
                </option>

                <option value="stream">
                    Stream
                </option>

                <option value="custom">
                    Custom
                </option>
            </select>
        </label>

        <label class="field">
            <span>Protocol</span>

            <select :value="edge.protocol ?? 'http'" @change="
                updateProtocol(
                    ($event.target as HTMLSelectElement)
                        .value as Protocol,
                )
                ">
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="grpc">gRPC</option>
                <option value="tcp">TCP</option>
                <option value="websocket">WebSocket</option>
                <option value="sql">SQL</option>
                <option value="amqp">AMQP</option>
                <option value="kafka">Kafka</option>
                <option value="epp">EPP</option>
                <option value="dns">DNS</option>
                <option value="custom">Custom</option>
            </select>
        </label>

        <button class="danger" @click="removeEdge">
            Delete connection
        </button>
    </aside>
</template>

<style scoped>
.edge-inspector {
    position: absolute;
    top: 16px;
    right: 16px;

    width: 280px;

    padding: 16px;

    background: white;
    border: 1px solid #e4e7ec;
    border-radius: 12px;

    box-shadow:
        0 4px 10px rgba(16, 24, 40, 0.06),
        0 12px 28px rgba(16, 24, 40, 0.08);

    z-index: 20;
}

.header {
    margin-bottom: 20px;
}

.eyebrow {
    margin-bottom: 4px;

    font-size: 11px;
    font-weight: 600;

    text-transform: uppercase;
    letter-spacing: 0.08em;

    color: #98a2b3;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    margin-bottom: 14px;

    font-size: 12px;
    font-weight: 500;

    color: #475467;
}

input,
select {
    width: 100%;

    padding: 9px 10px;

    border: 1px solid #d0d5dd;
    border-radius: 8px;

    background: white;
    color: #101828;
}

.danger {
    width: 100%;

    margin-top: 8px;
    padding: 9px 12px;

    border: 1px solid #fda29b;
    border-radius: 8px;

    background: #fff;
    color: #b42318;

    cursor: pointer;
}
</style>
