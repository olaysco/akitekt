<script setup lang="ts">
import { computed } from 'vue'

import type { NodeType } from '../../architectures/domain/node'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type Props = {
    nodeId: string | null
}

const props = defineProps<Props>()

const architectureStore = useArchitectureStore()

const node = computed(() =>
    architectureStore.architecture.nodes.find(
        (item) => item.id === props.nodeId,
    ),
)

function updateName(name: string) {
    if (!node.value) return

    architectureStore.execute({
        type: 'UPDATE_NODE',
        nodeId: node.value.id,
        changes: {
            name,
        },
    })
}

function updateType(type: NodeType) {
    if (!node.value) return

    architectureStore.execute({
        type: 'UPDATE_NODE',
        nodeId: node.value.id,
        changes: {
            type,
        },
    })
}

function updateTechnology(technology: string) {
    if (!node.value) return

    architectureStore.execute({
        type: 'UPDATE_NODE',
        nodeId: node.value.id,
        changes: {
            metadata: {
                ...node.value.metadata,
                technology: technology || undefined,
            },
        },
    })
}

function updateInstances(value: string) {
    if (!node.value) return

    const instances = Number(value)

    if (!Number.isFinite(instances) || instances < 1) {
        return
    }

    architectureStore.execute({
        type: 'UPDATE_NODE',
        nodeId: node.value.id,
        changes: {
            metadata: {
                ...node.value.metadata,
                instances,
            },
        },
    })
}

function updateTimeout(value: string) {
    if (!node.value) return

    if (!value) {
        architectureStore.execute({
            type: 'UPDATE_NODE',
            nodeId: node.value.id,
            changes: {
                behavior: {
                    ...node.value.behavior,
                    timeoutMs: undefined,
                },
            },
        })

        return
    }

    const timeoutMs = Number(value)

    if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
        return
    }

    architectureStore.execute({
        type: 'UPDATE_NODE',
        nodeId: node.value.id,
        changes: {
            behavior: {
                ...node.value.behavior,
                timeoutMs,
            },
        },
    })
}

function removeNode() {
    if (!node.value) return

    architectureStore.execute({
        type: 'REMOVE_NODE',
        nodeId: node.value.id,
    })
}
</script>
<template>
    <div v-if="node" class="node-inspector">
        <div class="header">
            <div class="header-title">
                <strong>
                    {{ node.name }}
                </strong>

                <span class="eyebrow">
                    {{ node.type }}
                </span>
            </div>

            <button class="danger" @click="removeNode">
                Delete
            </button>
        </div>

        <div class="fields">
            <label class="field">
                <span>Name</span>

                <input :value="node.name" @change="
                    updateName(
                        ($event.target as HTMLInputElement).value,
                    )
                    " />
            </label>

            <label class="field">
                <span>Type</span>

                <select :value="node.type" @change="
                    updateType(
                        ($event.target as HTMLSelectElement)
                            .value as NodeType,
                    )
                    ">
                    <option value="client">Client</option>
                    <option value="service">Service</option>
                    <option value="worker">Worker</option>
                    <option value="database">Database</option>
                    <option value="cache">Cache</option>
                    <option value="queue">Queue</option>
                    <option value="stream">Stream</option>
                    <option value="load-balancer">
                        Load balancer
                    </option>
                    <option value="gateway">Gateway</option>
                    <option value="external">
                        External system
                    </option>
                    <option value="storage">Storage</option>
                    <option value="scheduler">
                        Scheduler
                    </option>
                    <option value="custom">Custom</option>
                </select>
            </label>

            <label class="field">
                <span>Technology</span>

                <input :value="node.metadata.technology ?? ''" placeholder="e.g. Go, PostgreSQL, RabbitMQ" @change="
                    updateTechnology(
                        ($event.target as HTMLInputElement).value,
                    )
                    " />
            </label>

            <label class="field">
                <span>Instances</span>

                <input type="number" min="1" :value="node.metadata.instances ?? 1" @change="
                    updateInstances(
                        ($event.target as HTMLInputElement).value,
                    )
                    " />
            </label>

            <label class="field">
                <span>Timeout (ms)</span>

                <input type="number" min="0" :value="node.behavior.timeoutMs ?? ''" placeholder="None" @change="
                    updateTimeout(
                        ($event.target as HTMLInputElement).value,
                    )
                    " />
            </label>
        </div>
    </div>
</template>

<style scoped>
.node-inspector {
    width: 100%;
    min-height: 100%;

    display: flex;
    flex-direction: column;

    color:
        oklch(0.25 0.015 258);
}

.header {
    min-height: 54px;

    display: flex;
    align-items: center;
    gap: 10px;

    padding:
        9px 13px;

    border-bottom:
        1px solid oklch(0.93 0.006 258);
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

    color:
        oklch(0.22 0.016 258);

    font-size:
        13.5px;

    font-weight:
        600;

    letter-spacing:
        -0.015em;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.eyebrow {
    color:
        oklch(0.58 0.014 258);

    font-size:
        9.5px;

    letter-spacing:
        0.12em;

    text-transform:
        uppercase;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 13px;

    padding:
        13px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.field>span {
    color:
        oklch(0.58 0.014 258);

    font-size:
        9.5px;

    font-weight:
        400;

    letter-spacing:
        0.12em;

    text-transform:
        uppercase;
}

input,
select {
    width: 100%;

    box-sizing: border-box;

    padding:
        7px 9px;

    background:
        oklch(0.978 0.004 258);

    border:
        1px solid oklch(0.90 0.008 258);

    border-radius:
        7px;

    color:
        oklch(0.24 0.015 258);

    font-family:
        inherit;

    font-size:
        12px;

    outline:
        none;
}

input:focus,
select:focus {
    border-color:
        oklch(0.60 0.19 258);
}

.danger {
    flex: none;

    padding: 4px 8px;

    background:
        transparent;

    border: 1px solid oklch(0.90 0.02 27);

    border-radius: 6px;

    color: oklch(0.58 0.21 27);

    font-family: inherit;

    font-size: 10.5px;

    cursor: pointer;
}
</style>
