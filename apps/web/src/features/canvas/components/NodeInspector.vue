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
    <aside v-if="node" class="node-inspector">
        <div class="header">
            <div class="eyebrow">
                Component
            </div>

            <strong>
                {{ node.name }}
            </strong>
        </div>

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
                <option value="load-balancer">Load balancer</option>
                <option value="gateway">Gateway</option>
                <option value="external">External system</option>
                <option value="storage">Storage</option>
                <option value="scheduler">Scheduler</option>
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

        <button class="danger" @click="removeNode">
            Delete component
        </button>
    </aside>
</template>

<style scoped>
.node-inspector {
    position: absolute;
    top: 16px;
    right: 16px;

    width: 280px;
    padding: 16px;

    background: white;
    border: 1px solid #e4e7ec;
    /* border-radius: 12px;

    box-shadow:
        0 4px 10px rgba(16, 24, 40, 0.06),
        0 12px 28px rgba(16, 24, 40, 0.08);

    z-index: 20; */
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
    box-sizing: border-box;

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

    background: white;
    color: #b42318;

    cursor: pointer;
}
</style>
