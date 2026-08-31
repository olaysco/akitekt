<script setup lang="ts">
import { computed } from 'vue'
import type { EdgeType, Protocol } from '../../architectures/domain/edge'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type Props = {
    edgeId: string | null
}

const props = defineProps<Props>()
const architectureStore = useArchitectureStore()

const edge = computed(() => architectureStore.architecture.edges.find((item) => item.id === props.edgeId))

const sourceNode = computed(() =>
    architectureStore.architecture.nodes.find((node) => node.id === edge.value?.source.nodeId),
)

const targetNode = computed(() =>
    architectureStore.architecture.nodes.find((node) => node.id === edge.value?.target.nodeId),
)

function updateType(type: EdgeType) {
    if (!edge.value) return

    architectureStore.execute({
        type: 'UPDATE_EDGE',
        edgeId: edge.value.id,
        changes: { type },
    })
}

function updateProtocol(protocol: Protocol) {
    if (!edge.value) return

    architectureStore.execute({
        type: 'UPDATE_EDGE',
        edgeId: edge.value.id,
        changes: { protocol },
    })
}

function updateLabel(label: string) {
    if (!edge.value) return

    architectureStore.execute({
        type: 'UPDATE_EDGE',
        edgeId: edge.value.id,
        changes: { label },
    })
}

function removeEdge() {
    if (!edge.value) return

    architectureStore.execute({
        type: 'REMOVE_EDGE',
        edgeId: edge.value.id,
    })
}
</script>

<template>
    <div v-if="edge" class="edge-inspector">
        <div class="header">
            <div class="header-title">
                <strong>{{ sourceNode?.name ?? 'Unknown' }} → {{ targetNode?.name ?? 'Unknown' }}</strong>
                <span class="eyebrow">Connection · {{ edge.protocol ?? 'custom' }}</span>
            </div>

            <button class="danger" @click="removeEdge">Delete</button>
        </div>

        <div class="fields">
            <label class="field">
                <span>Label</span>
                <input :value="edge.label ?? ''" placeholder="e.g. Provision DNS"
                    @change="updateLabel(($event.target as HTMLInputElement).value)" />
            </label>

            <label class="field">
                <span>Type</span>
                <select :value="edge.type" @change="updateType(($event.target as HTMLSelectElement).value as EdgeType)">
                    <option value="sync">Synchronous</option>
                    <option value="async">Asynchronous</option>
                    <option value="event">Event</option>
                    <option value="query">Query</option>
                    <option value="replication">Replication</option>
                    <option value="stream">Stream</option>
                    <option value="custom">Custom</option>
                </select>
            </label>

            <label class="field">
                <span>Protocol</span>
                <select :value="edge.protocol ?? 'http'"
                    @change="updateProtocol(($event.target as HTMLSelectElement).value as Protocol)">
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
        </div>
    </div>
</template>

<style scoped>
.edge-inspector {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    color: oklch(0.25 0.015 258);
}

.header {
    min-height: 54px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 13px;
    border-bottom: 1px solid oklch(0.93 0.006 258);
}

.header-title {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
}

.header strong {
    overflow: hidden;
    color: oklch(0.22 0.016 258);
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: -0.015em;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.eyebrow {
    color: oklch(0.58 0.014 258);
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 13px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.field>span {
    color: oklch(0.58 0.014 258);
    font-size: 9.5px;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

input,
select {
    width: 100%;
    box-sizing: border-box;
    padding: 7px 9px;
    background: oklch(0.978 0.004 258);
    border: 1px solid oklch(0.90 0.008 258);
    border-radius: 7px;
    color: oklch(0.24 0.015 258);
    font-family: inherit;
    font-size: 12px;
    outline: none;
}

input:focus,
select:focus {
    border-color: oklch(0.60 0.19 258);
}

.danger {
    flex: none;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid oklch(0.90 0.02 27);
    border-radius: 6px;
    color: oklch(0.58 0.21 27);
    font-family: inherit;
    font-size: 10.5px;
    cursor: pointer;
}
</style>
