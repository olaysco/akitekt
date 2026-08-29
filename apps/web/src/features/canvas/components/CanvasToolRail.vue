<script setup lang="ts">
import { ref } from 'vue'
import type { NodeType } from '../../architectures/domain/node'

type ComponentRole = {
    type: NodeType
    label: string
    technologies: string[]
}

export type AddComponentPayload = {
    type: NodeType
    technology?: string
}

const emit = defineEmits<{
    addComponent: [payload: AddComponentPayload]
}>()

const componentsOpen = ref(false)
const selectedRole = ref<ComponentRole | null>(null)

const roles: ComponentRole[] = [
    {
        type: 'service',
        label: 'Service',
        technologies: ['Generic', 'Go', 'Node.js', 'Java', 'Python'],
    },
    {
        type: 'database',
        label: 'Database',
        technologies: [
            'PostgreSQL',
            'MySQL',
            'MongoDB',
            'DynamoDB',
            'Cassandra',
        ],
    },
    {
        type: 'queue',
        label: 'Queue',
        technologies: ['RabbitMQ', 'Kafka', 'SQS', 'Pub / Sub', 'NATS'],
    },
    {
        type: 'cache',
        label: 'Cache',
        technologies: ['Redis', 'Memcached'],
    },
    {
        type: 'worker',
        label: 'Worker',
        technologies: ['Generic', 'Celery', 'Sidekiq'],
    },
    {
        type: 'client',
        label: 'Client',
        technologies: ['Browser', 'Mobile app', 'CLI'],
    },
    {
        type: 'external',
        label: 'External system',
        technologies: ['Third-party API', 'SaaS', 'Partner'],
    },
    {
        type: 'gateway',
        label: 'Gateway',
        technologies: ['Kong', 'Envoy', 'Nginx'],
    },
    {
        type: 'load-balancer',
        label: 'Load balancer',
        technologies: ['ALB', 'HAProxy', 'Nginx'],
    },
]

function toggleComponents() {
    componentsOpen.value = !componentsOpen.value

    if (!componentsOpen.value) {
        selectedRole.value = null
    }
}

function selectRole(role: ComponentRole) {
    selectedRole.value = role
}

function addComponent(role: ComponentRole, technology: string) {
    emit('addComponent', {
        type: role.type,
        technology:
            technology === 'Generic'
                ? undefined
                : technology,
    })

    componentsOpen.value = false
    selectedRole.value = null
}
</script>

<template>
    <div class="tool-system">
        <div class="tool-rail">
            <button class="tool-button" :class="{ active: componentsOpen }" title="Components"
                @click.stop="toggleComponents">
                <span class="tool-symbol">＋</span>
                <span class="tool-tooltip">Components</span>
            </button>

            <button class="tool-button" title="Annotation" disabled>
                <span class="tool-symbol text-symbol">T</span>
                <span class="tool-tooltip">Annotation</span>
            </button>

            <button class="tool-button" title="Region" disabled>
                <span class="tool-symbol region-symbol">□</span>
                <span class="tool-tooltip">Region</span>
            </button>
        </div>

        <div v-if="componentsOpen" class="component-flyout" @click.stop>
            <div class="role-list">
                <div class="flyout-heading">
                    Components
                </div>

                <button v-for="role in roles" :key="role.type" class="role-row" :class="{
                    selected:
                        selectedRole?.type === role.type,
                }" @click="selectRole(role)">
                    <span class="role-glyph" :class="`role-${role.type}`">
                        <span v-if="role.type === 'database'" class="glyph-database" />

                        <span v-else-if="role.type === 'queue'" class="glyph-queue">
                            <i />
                            <i />
                            <i />
                        </span>

                        <span v-else-if="
                            role.type === 'worker' ||
                            role.type === 'client'
                        " class="glyph-ring" />

                        <span v-else-if="role.type === 'external'" class="glyph-external" />

                        <span v-else-if="
                            role.type === 'cache' ||
                            role.type === 'gateway' ||
                            role.type === 'load-balancer'
                        " class="glyph-diamond" />

                        <span v-else class="glyph-box" />
                    </span>

                    <span class="role-label">
                        {{ role.label }}
                    </span>

                    <span class="role-chevron">
                        ›
                    </span>
                </button>
            </div>

            <div v-if="selectedRole" class="technology-list">
                <div class="flyout-heading">
                    {{ selectedRole.label }}
                </div>

                <button v-for="technology in selectedRole.technologies" :key="technology" class="technology-row" @click="
                    addComponent(
                        selectedRole,
                        technology,
                    )
                    ">
                    {{ technology }}
                </button>
            </div>

            <div v-else class="technology-empty">
                Select a component type
            </div>
        </div>
    </div>
</template>

<style scoped>
.tool-system {
    position: absolute;
    left: 16px;
    top: 18px;
    z-index: 20;

    font-family:
        "IBM Plex Sans",
        system-ui,
        sans-serif;
}

.tool-rail {
    width: 42px;

    display: flex;
    flex-direction: column;

    padding: 4px;

    background:
        oklch(0.99 0.003 258);

    border:
        1px solid oklch(0.875 0.009 258);

    border-radius: 9px;

    box-shadow:
        0 3px 12px oklch(0.35 0.02 258 / 0.08);
}

.tool-button {
    position: relative;

    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    background: transparent;

    border: 0;
    border-radius: 6px;

    color:
        oklch(0.43 0.014 258);

    cursor: pointer;
}

.tool-button:hover,
.tool-button.active {
    background:
        oklch(0.95 0.025 258);

    color:
        oklch(0.44 0.19 258);
}

.tool-button:disabled {
    cursor: default;
    opacity: 0.48;
}

.tool-symbol {
    font-size: 17px;
    font-weight: 400;
    line-height: 1;
}

.text-symbol {
    font-size: 14px;
    font-weight: 500;
}

.region-symbol {
    font-size: 17px;
}

.tool-tooltip {
    position: absolute;
    left: 42px;

    padding: 4px 7px;

    background:
        oklch(0.28 0.014 258);

    border-radius: 5px;

    color: white;

    font-size: 10px;

    opacity: 0;
    pointer-events: none;

    white-space: nowrap;

    transform: translateX(-3px);

    transition:
        opacity 100ms ease,
        transform 100ms ease;
}

.tool-button:hover .tool-tooltip {
    opacity: 1;
    transform: translateX(0);
}

.component-flyout {
    position: absolute;
    left: 50px;
    top: 0;

    display: flex;

    min-height: 310px;

    background:
        oklch(0.995 0.002 258);

    border:
        1px solid oklch(0.875 0.009 258);

    border-radius: 9px;

    box-shadow:
        0 8px 24px oklch(0.35 0.02 258 / 0.11);

    overflow: hidden;
}

.role-list {
    width: 188px;

    padding: 7px;

    border-right:
        1px solid oklch(0.905 0.007 258);
}

.technology-list {
    width: 175px;

    padding: 7px;
}

.flyout-heading {
    padding: 6px 7px 8px;

    color:
        oklch(0.60 0.014 258);

    font-size: 9px;
    font-weight: 500;

    letter-spacing: 0.1em;

    text-transform: uppercase;
}

.role-row,
.technology-row {
    width: 100%;

    border: 0;
    border-radius: 6px;

    background: transparent;

    color:
        oklch(0.34 0.014 258);

    font-family: inherit;
    font-size: 11px;

    cursor: pointer;
}

.role-row {
    height: 34px;

    display: flex;
    align-items: center;

    gap: 9px;

    padding: 0 8px;

    text-align: left;
}

.role-row:hover,
.role-row.selected,
.technology-row:hover {
    background:
        oklch(0.955 0.012 258);
}

.role-row.selected {
    color:
        oklch(0.44 0.19 258);
}

.role-glyph {
    width: 22px;
    height: 22px;

    flex: 0 0 22px;

    display: flex;
    align-items: center;
    justify-content: center;

    color:
        oklch(0.50 0.014 258);
}

.role-label {
    flex: 1;
}

.role-chevron {
    color:
        oklch(0.68 0.012 258);

    font-size: 15px;
}

.technology-row {
    display: block;

    padding: 8px 9px;

    text-align: left;
}

.technology-empty {
    width: 175px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    color:
        oklch(0.64 0.012 258);

    font-size: 10.5px;

    text-align: center;
}

/* Shape language from the design */

.glyph-box {
    width: 17px;
    height: 13px;

    border:
        1.3px solid currentColor;

    border-radius: 3px;
}

.glyph-database {
    position: relative;

    width: 17px;
    height: 14px;

    border:
        1.3px solid currentColor;

    border-radius: 50% / 24%;
}

.glyph-database::before {
    content: "";

    position: absolute;

    left: -1.3px;
    right: -1.3px;
    top: 3px;

    height: 3px;

    border-top:
        1.3px solid currentColor;

    border-radius: 50%;
}

.glyph-queue {
    width: 18px;

    display: flex;
    flex-direction: column;

    gap: 2px;
}

.glyph-queue i {
    display: block;

    width: 18px;
    height: 3px;

    border:
        1.2px solid currentColor;

    border-radius: 1px;
}

.glyph-ring {
    width: 15px;
    height: 15px;

    border:
        1.4px solid currentColor;

    border-radius: 50%;
}

.glyph-external {
    width: 17px;
    height: 13px;

    border:
        1.3px dashed currentColor;

    border-radius: 3px;
}

.glyph-diamond {
    width: 13px;
    height: 13px;

    border:
        1.3px solid currentColor;

    transform: rotate(45deg);
}
</style>
