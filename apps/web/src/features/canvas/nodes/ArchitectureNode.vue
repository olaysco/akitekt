<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

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
</script>

<template>
    <div class="architecture-node" :class="{
        selected,
        external: isExternal,
    }">
        <Handle type="target" :position="Position.Left" class="node-handle" />

        <div class="node-main">
            <div class="node-icon">
                <!-- Database -->
                <svg v-if="data.nodeType === 'database'" viewBox="0 0 28 28" aria-hidden="true">
                    <ellipse cx="14" cy="7" rx="8" ry="3.5" />

                    <path d="
              M6 7v7
              c0 1.9 3.6 3.5 8 3.5
              s8-1.6 8-3.5V7
            " />

                    <path d="
              M6 14v7
              c0 1.9 3.6 3.5 8 3.5
              s8-1.6 8-3.5v-7
            " />
                </svg>

                <!-- Queue -->
                <svg v-else-if="data.nodeType === 'queue'" viewBox="0 0 28 28" aria-hidden="true">
                    <rect x="5" y="6" width="18" height="4" rx="1" />

                    <rect x="5" y="12" width="18" height="4" rx="1" />

                    <rect x="5" y="18" width="18" height="4" rx="1" />
                </svg>

                <!-- Worker -->
                <svg v-else-if="data.nodeType === 'worker'" viewBox="0 0 28 28" aria-hidden="true">
                    <circle cx="14" cy="14" r="9" />

                    <path d="M14 9v5l4 2" />
                </svg>

                <!-- Client -->
                <svg v-else-if="data.nodeType === 'client'" viewBox="0 0 28 28" aria-hidden="true">
                    <circle cx="14" cy="10" r="4" />

                    <path d="
              M7 23
              c.8-5 3.5-7.5 7-7.5
              s6.2 2.5 7 7.5
            " />
                </svg>

                <!-- External -->
                <svg v-else-if="data.nodeType === 'external'" viewBox="0 0 28 28" aria-hidden="true">
                    <rect x="5" y="5" width="18" height="18" rx="3" stroke-dasharray="3 2" />

                    <path d="
              M12 16
              l7-7
              M14 9
              h5
              v5
            " />
                </svg>

                <!-- Cache -->
                <svg v-else-if="data.nodeType === 'cache'" viewBox="0 0 28 28" aria-hidden="true">
                    <path d="
              M7 8
              h14
              v5
              H7
              z
            " />

                    <path d="
              M7 15
              h14
              v5
              H7
              z
            " />

                    <circle cx="18.5" cy="10.5" r="1" />

                    <circle cx="18.5" cy="17.5" r="1" />
                </svg>

                <!-- Gateway / Load balancer -->
                <svg v-else-if="
                    data.nodeType === 'gateway' ||
                    data.nodeType ===
                    'load-balancer'
                " viewBox="0 0 28 28" aria-hidden="true">
                    <circle cx="7" cy="14" r="2" />

                    <circle cx="21" cy="8" r="2" />

                    <circle cx="21" cy="20" r="2" />

                    <path d="
              M9 14
              h4

              M13 14
              l6-5

              M13 14
              l6 5
            " />
                </svg>

                <!-- Generic service -->
                <svg v-else viewBox="0 0 28 28" aria-hidden="true">
                    <rect x="5" y="6" width="18" height="16" rx="3" />

                    <path d="
              M9 11
              h10

              M9 15
              h7
            " />

                    <circle cx="19" cy="18" r="1" />
                </svg>
            </div>

            <div class="node-copy">
                <div class="node-name">
                    {{ data.label }}
                </div>

                <div class="node-subtitle">
                    {{ subtitle }}
                </div>

                <div v-if="chips.length" class="node-chips">
                    <span v-for="chip in chips" :key="chip" class="node-chip">
                        {{ chip }}
                    </span>
                </div>
            </div>
        </div>

        <Handle type="source" :position="Position.Right" class="node-handle" />
    </div>
</template>

<style scoped>
.architecture-node {
    width: 204px;
    min-height: 88px;

    position: relative;

    padding: 13px 14px;

    background:
        oklch(1 0 0);

    border:
        1px solid oklch(0.875 0.008 258);

    border-radius: 11px;

    color:
        oklch(0.25 0.015 258);

    font-family:
        "IBM Plex Sans",
        system-ui,
        sans-serif;

    box-shadow:
        0 1px 2px oklch(0.5 0.02 258 / 0.04);

    transition:
        border-color 120ms ease,
        box-shadow 120ms ease;
}

.architecture-node.external {
    border-style: dashed;
}

.architecture-node.selected {
    border:
        1.5px solid oklch(0.60 0.19 258);

    box-shadow:
        0 0 0 3px oklch(0.60 0.19 258 / 0.16);
}

.node-main {
    display: flex;
    align-items: flex-start;

    gap: 11px;
}

.node-icon {
    width: 31px;
    height: 31px;

    flex: 0 0 31px;

    display: flex;
    align-items: center;
    justify-content: center;

    color:
        oklch(0.48 0.018 258);
}

.node-icon svg {
    width: 28px;
    height: 28px;

    fill: none;

    stroke: currentColor;
    stroke-width: 1.4;

    stroke-linecap: round;
    stroke-linejoin: round;
}

.node-icon svg rect {
    vector-effect:
        non-scaling-stroke;
}

.node-icon svg ellipse,
.node-icon svg circle,
.node-icon svg path {
    vector-effect:
        non-scaling-stroke;
}

.node-copy {
    min-width: 0;
    flex: 1;
}

.node-name {
    overflow: hidden;

    color:
        oklch(0.24 0.015 258);

    font-size: 12px;
    font-weight: 600;

    line-height: 1.3;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.node-subtitle {
    margin-top: 2px;

    overflow: hidden;

    color:
        oklch(0.56 0.014 258);

    font-size: 10.5px;
    font-weight: 400;

    line-height: 1.35;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.node-chips {
    display: flex;
    flex-wrap: wrap;

    gap: 4px;

    margin-top: 9px;
}

.node-chip {
    padding: 2px 6px;

    border:
        1px solid oklch(0.895 0.008 258);

    border-radius: 5px;

    background:
        oklch(0.975 0.004 258);

    color:
        oklch(0.46 0.014 258);

    font-size: 9px;
    font-weight: 500;

    line-height: 1.4;

    white-space: nowrap;
}

.node-handle {
    width: 8px;
    height: 8px;

    border:
        1.5px solid white;

    background:
        oklch(0.66 0.018 258);

    opacity: 0;

    transition:
        opacity 100ms ease,
        background 100ms ease;
}

.architecture-node:hover .node-handle,
.architecture-node.selected .node-handle {
    opacity: 1;
}

.node-handle:hover {
    background:
        oklch(0.60 0.19 258);
}
</style>
