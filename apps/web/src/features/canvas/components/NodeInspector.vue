<script setup lang="ts">
import { computed } from 'vue'

import type { NodeType } from '../../architectures/domain/node'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'
import { injectionOptions, type InjectionKind } from '../../simulation/services/create-execution-trace'
import { useSimulationStore } from '../../simulation/stores/simulation.store'

type Props = {
    nodeId: string | null
}

const props = defineProps<Props>()

const architectureStore = useArchitectureStore()
const simulationStore = useSimulationStore()

const node = computed(() =>
    architectureStore.architecture.nodes.find(
        (item) => item.id === props.nodeId,
    ),
)

function isInjected(kind: InjectionKind): boolean {
    return (
        simulationStore.injection?.nodeId === props.nodeId &&
        simulationStore.injection.kind === kind
    )
}

function pickInjection(kind: InjectionKind) {
    if (!node.value) return

    simulationStore.setInjection(node.value.id, kind)
}

function runWithInjection() {
    simulationStore.run(architectureStore.architecture)
}

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

        <div class="injection">
            <span class="eyebrow">Simulate failure</span>

            <button v-for="option in injectionOptions" :key="option.kind" type="button" class="injection-row"
                :class="{ picked: isInjected(option.kind) }" @click="pickInjection(option.kind)">
                <span class="radio" />

                <span>
                    {{ option.label }}
                </span>
            </button>

            <button type="button" class="injection-run" @click="runWithInjection">
                Run with this scenario
            </button>
        </div>
    </div>
</template>

<style scoped>
.injection {
    display: flex;
    flex-direction: column;
    gap: 6px;

    padding: 12px 13px 14px;

    border-top: 1px solid oklch(0.93 0.006 258);
}

.injection .eyebrow {
    margin-bottom: 2px;
}

.injection-row {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 6px 8px;

    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;

    color: oklch(0.34 0.014 258);
    font-family: inherit;
    font-size: 11.5px;
    text-align: left;

    cursor: pointer;
}

.injection-row:hover {
    background: oklch(0.975 0.004 258);
}

.injection-row.picked {
    border-color: oklch(0.58 0.21 27 / 0.30);
    background: oklch(0.58 0.21 27 / 0.07);
    color: oklch(0.42 0.014 258);
}

.radio {
    width: 9px;
    height: 9px;

    flex: none;

    border: 1px solid oklch(0.78 0.01 258);
    border-radius: 50%;
}

.injection-row.picked .radio {
    border-color: oklch(0.58 0.21 27);
    background: oklch(0.58 0.21 27);
}

.injection-run {
    margin-top: 5px;

    padding: 8px 10px;

    background: oklch(0.962 0.006 258);
    border: 1px solid oklch(0.87 0.01 258);
    border-radius: 7px;

    color: oklch(0.27 0.015 258);
    font-family: inherit;
    font-size: 11.5px;

    cursor: pointer;
}

.injection-run:hover {
    border-color: oklch(0.66 0.16 258);
}

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
