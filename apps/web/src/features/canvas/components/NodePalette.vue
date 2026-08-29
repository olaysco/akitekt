<script setup lang="ts">
import type { NodeType } from '../../architectures/domain/node'

type PaletteItem = {
    type: NodeType
    label: string
    description: string
}

const emit = defineEmits<{
    add: [type: NodeType]
}>()

const items: PaletteItem[] = [
    {
        type: 'client',
        label: 'Client',
        description: 'User or application',
    },
    {
        type: 'service',
        label: 'Service',
        description: 'Application service',
    },
    {
        type: 'worker',
        label: 'Worker',
        description: 'Background process',
    },
    {
        type: 'database',
        label: 'Database',
        description: 'Persistent data store',
    },
    {
        type: 'queue',
        label: 'Queue',
        description: 'Message broker',
    },
    {
        type: 'cache',
        label: 'Cache',
        description: 'Fast temporary store',
    },
    {
        type: 'gateway',
        label: 'Gateway',
        description: 'API entry point',
    },
    {
        type: 'load-balancer',
        label: 'Load balancer',
        description: 'Traffic distribution',
    },
    {
        type: 'external',
        label: 'External',
        description: 'Third-party system',
    },
]
</script>

<template>
    <aside class="node-palette">
        <div class="palette-header">
            <span class="palette-title">
                Components
            </span>
        </div>

        <div class="palette-items">
            <button v-for="item in items" :key="item.type" class="palette-item" type="button"
                @click="emit('add', item.type)">
                <span class="palette-icon" :class="`palette-icon-${item.type}`">
                    <!-- Service -->
                    <svg v-if="item.type === 'service'" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="4" y="5" width="16" height="14" rx="3" />
                        <path d="M8 9h8M8 13h5" />
                    </svg>

                    <!-- Database -->
                    <svg v-else-if="item.type === 'database'" viewBox="0 0 24 24" aria-hidden="true">
                        <ellipse cx="12" cy="6" rx="7" ry="3" />
                        <path d="
                M5 6v6
                c0 1.7 3.1 3 7 3
                s7-1.3 7-3V6
              " />
                        <path d="
                M5 12v6
                c0 1.7 3.1 3 7 3
                s7-1.3 7-3v-6
              " />
                    </svg>

                    <!-- Queue -->
                    <svg v-else-if="item.type === 'queue'" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="4" y="5" width="16" height="3" rx="1" />
                        <rect x="4" y="10.5" width="16" height="3" rx="1" />
                        <rect x="4" y="16" width="16" height="3" rx="1" />
                    </svg>

                    <!-- Worker -->
                    <svg v-else-if="item.type === 'worker'" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="7" />
                        <path d="M12 8v4l3 2" />
                    </svg>

                    <!-- Client -->
                    <svg v-else-if="item.type === 'client'" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="8" r="3" />
                        <path d="M6 19c.7-4 3-6 6-6s5.3 2 6 6" />
                    </svg>

                    <!-- External -->
                    <svg v-else-if="item.type === 'external'" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="4" y="4" width="16" height="16" rx="3" stroke-dasharray="3 2" />
                        <path d="M10 14l6-6M12 8h4v4" />
                    </svg>

                    <!-- Generic -->
                    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="5" y="5" width="14" height="14" rx="3" />
                    </svg>
                </span>

                <span class="palette-copy">
                    <span class="item-label">
                        {{ item.label }}
                    </span>

                    <span class="item-description">
                        {{ item.description }}
                    </span>
                </span>
            </button>
        </div>
    </aside>
</template>

<style scoped>
.node-palette {
    position: absolute;
    top: 16px;
    left: 16px;

    width: 210px;

    background: rgba(255, 255, 255, 0.96);
    border: 1px solid #e1e4e9;
    border-radius: 10px;

    box-shadow:
        0 2px 4px rgba(40, 45, 55, 0.06),
        0 16px 34px -20px rgba(40, 45, 55, 0.34);

    overflow: hidden;
    z-index: 20;
}

.palette-header {
    display: flex;
    align-items: center;

    height: 38px;
    padding: 0 12px;

    border-bottom: 1px solid #eceef1;
}

.palette-title {
    font-size: 11px;
    font-weight: 600;

    color: #69707c;
}

.palette-items {
    padding: 6px;
}

.palette-item {
    width: 100%;

    display: flex;
    align-items: center;
    gap: 10px;

    padding: 7px 8px;

    border: 0;
    border-radius: 7px;

    background: transparent;

    text-align: left;
    cursor: pointer;
}

.palette-item:hover {
    background: #f6f7f9;
}

.palette-icon {
    width: 30px;
    height: 30px;

    flex: 0 0 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #626a77;
}

.palette-icon svg {
    width: 22px;
    height: 22px;

    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.palette-icon-queue svg rect {
    fill: currentColor;
    stroke: none;
}

.palette-copy {
    min-width: 0;

    display: flex;
    flex-direction: column;
    gap: 1px;
}

.item-label {
    font-size: 12px;
    font-weight: 500;

    color: #252932;
}

.item-description {
    font-size: 10px;

    color: #8a909b;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
