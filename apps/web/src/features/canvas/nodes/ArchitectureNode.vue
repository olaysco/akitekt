<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

type NodePropertyValue =
    | string
    | number
    | boolean

type Props = {
    selected?: boolean

    data: {
        label: string
        nodeType: string

        technology?: string
        instances?: number
        timeoutMs?: number

        properties?: Record<
            string,
            NodePropertyValue
        >
    }
}

const props = defineProps<Props>()

const subtitle = computed(() =>
    props.data.technology ||
    props.data.nodeType,
)

const isExternal = computed(
    () => props.data.nodeType === 'external',
)

const chips = computed(() => {
    const result: string[] = []

    if (props.data.instances) {
        result.push(
            `×${props.data.instances} ${props.data.instances === 1
                ? 'instance'
                : 'instances'
            }`,
        )
    }

    if (
        props.data.timeoutMs !== undefined
    ) {
        const milliseconds =
            props.data.timeoutMs

        const timeout =
            milliseconds >= 1000
                ? `${milliseconds / 1000
                } s`
                : `${milliseconds} ms`

        result.push(`timeout ${timeout}`)
    }

    const properties =
        props.data.properties ?? {}

    Object.entries(properties)
        .slice(0, 3)
        .forEach(([key, value]) => {
            if (
                value === false ||
                value === undefined ||
                value === null
            ) {
                return
            }

            if (value === true) {
                result.push(key)
                return
            }

            result.push(`${key} ${value}`)
        })

    return result.slice(0, 3)
})

const emit = defineEmits<{
    resizeEnd: [
        size: {
            width: number
            height: number
        },
    ]
}>()

function handleResizeEnd(
    event: {
        params: {
            width: number
            height: number
        }
    },
) {
    emit('resizeEnd', {
        width: event.params.width,
        height: event.params.height,
    })
}
</script>

<template>
    <div class="architecture-node" :class="{
        selected,
        external: isExternal,
    }">
        <NodeResizer v-if="selected" :min-width="160" :min-height="72" @resize-end="handleResizeEnd" />

        <Handle type="target" :position="Position.Left" class="node-handle" />

        <div class="node-card">
            <div class="node-header">
                <span class="node-glyph">
                    <span v-if="data.nodeType === 'database'" class="glyph-database" />

                    <span v-else-if="data.nodeType === 'queue'" class="glyph-queue">
                        <i />
                        <i />
                        <i />
                    </span>

                    <span v-else-if="
                        data.nodeType === 'worker' ||
                        data.nodeType === 'client'
                    " class="glyph-ring" />

                    <span v-else-if="
                        data.nodeType === 'cache' ||
                        data.nodeType === 'gateway' ||
                        data.nodeType === 'load-balancer'
                    " class="glyph-diamond" />

                    <span v-else-if="data.nodeType === 'external'" class="glyph-external" />

                    <span v-else class="glyph-box" />
                </span>

                <span class="node-type">
                    {{ data.nodeType }}
                </span>
            </div>

            <div class="node-name">
                {{ data.label }}
            </div>

            <div class="node-subtitle">
                {{ subtitle }}
            </div>

            <div class="node-spacer" />

            <div v-if="chips.length" class="node-chips">
                <span v-for="chip in chips" :key="chip" class="node-chip">
                    {{ chip }}
                </span>
            </div>
        </div>

        <Handle type="source" :position="Position.Right" class="node-handle" />
    </div>
</template>

<style scoped>
.architecture-node {
    position: relative;

    width: 100%;
    height: 100%;

    min-width: 160px;
    min-height: 72px;

    display: flex;
    flex-direction: column;

    padding: 9px 11px 8px;

    background:
        oklch(1 0 0);

    border:
        1px solid oklch(0.885 0.008 258);

    border-radius: 11px;

    color:
        oklch(0.25 0.015 258);

    font-family:
        'IBM Plex Sans',
        system-ui,
        sans-serif;

    box-shadow:
        0 1px 2px oklch(0.55 0.03 258 / 0.10),
        0 10px 24px -16px oklch(0.50 0.05 258 / 0.28);

    cursor: grab;

    transition:
        border-color 120ms ease,
        box-shadow 120ms ease;
}

.architecture-node:active {
    cursor: grabbing;
}

.architecture-node.external {
    border-style: dashed;
}

.architecture-node.selected {
    border-color:
        oklch(0.60 0.19 258);

    box-shadow:
        0 0 0 2px oklch(0.60 0.19 258 / 0.12),
        0 1px 2px oklch(0.55 0.03 258 / 0.10),
        0 10px 24px -16px oklch(0.50 0.05 258 / 0.28);
}

.node-header {
    height: 12px;

    display: flex;
    align-items: center;

    gap: 7px;
}

.node-glyph {
    flex: none;

    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.node-type {
    overflow: hidden;

    color:
        oklch(0.56 0.014 258);

    font-size: 8.5px;

    letter-spacing: 0.15em;

    line-height: 1;

    text-transform: uppercase;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.node-name {
    margin-top: 7px;

    overflow: hidden;

    color:
        oklch(0.22 0.016 258);

    font-size: 13.5px;
    font-weight: 600;

    letter-spacing: -0.012em;

    line-height: 1.2;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.node-subtitle {
    margin-top: 3px;

    overflow: hidden;

    color:
        oklch(0.56 0.014 258);

    font-size: 9.5px;

    line-height: 1.3;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.node-spacer {
    flex: 1;
}

.node-chips {
    display: flex;
    flex-wrap: wrap;

    gap: 5px;
}

.node-chip {
    padding: 2px 5px;

    border-radius: 4px;

    background:
        oklch(0.962 0.006 258);

    color:
        oklch(0.50 0.014 258);

    font-size: 8.5px;

    line-height: 1.35;

    white-space: nowrap;
}

/* Service / generic */
.glyph-box {
    width: 9px;
    height: 9px;

    border-radius: 2.5px;

    background:
        oklch(0.56 0.02 258);
}

/* Database */
.glyph-database {
    width: 9px;
    height: 11px;

    border:
        1.5px solid oklch(0.56 0.02 258);

    border-radius:
        50% / 26%;
}

/* Queue */
.glyph-queue {
    display: flex;
    flex-direction: column;

    gap: 1.5px;
}

.glyph-queue i {
    display: block;

    width: 11px;
    height: 2px;

    background:
        oklch(0.56 0.02 258);
}

/* Worker / client */
.glyph-ring {
    width: 10px;
    height: 10px;

    border:
        1.5px solid oklch(0.56 0.02 258);

    border-radius: 50%;
}

/* Cache / gateway / load balancer */
.glyph-diamond {
    width: 9px;
    height: 9px;

    background:
        oklch(0.56 0.02 258);

    transform:
        rotate(45deg);
}

/* External */
.glyph-external {
    width: 9px;
    height: 9px;

    border:
        1.5px dashed oklch(0.62 0.02 258);

    border-radius: 2px;
}

.node-handle {
    width: 8px;
    height: 8px;

    border: 1.5px solid oklch(1 0 0);

    background: oklch(0.66 0.018 258);

    opacity: 0;

    transition: opacity 100ms ease, background 100ms ease;
}

.architecture-node:hover .node-handle,
.architecture-node.selected .node-handle {
    opacity: 1;
}

.node-handle:hover {
    background:
        oklch(0.60 0.19 258);
}

.node-handle {
    width: 8px;
    height: 8px;

    border:
        1.5px solid oklch(1 0 0);

    background:
        oklch(0.66 0.018 258);

    opacity: 0;

    transition:
        opacity 100ms ease,
        background 100ms ease;
}

.architecture-node :deep(.vue-flow__handle-left) {
    left: -4px;
}

.architecture-node :deep(.vue-flow__handle-right) {
    right: -4px;
}

</style>
