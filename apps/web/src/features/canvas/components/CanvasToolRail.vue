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
    annotationTool: []
    regionTool: []
}>()

const regionActive = ref(false)
const componentsOpen = ref(false)
const annotationActive = ref(false)
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

    annotationActive.value = false
    regionActive.value = false

    if (!componentsOpen.value) {
        selectedRole.value = null
    }
}

function toggleAnnotation() {
    annotationActive.value = !annotationActive.value

    regionActive.value = false
    componentsOpen.value = false
    selectedRole.value = null

    emit('annotationTool')
}

function deactivateAnnotation() {
    annotationActive.value = false
}

function toggleRegion() {
    regionActive.value = !regionActive.value

    annotationActive.value = false
    componentsOpen.value = false
    selectedRole.value = null

    emit('regionTool')
}

function deactivateRegion() {
    regionActive.value = false
}

function selectRole(
    role: ComponentRole,
) {
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

defineExpose({
    deactivateRegion,
    deactivateAnnotation,
})
</script>

<template>
    <div class="tool-system">
        <aside class="canvas-tool-rail">
            <button class="tool-button" :class="{ active: componentsOpen }" title="Components"
                @click="toggleComponents">
                ＋
            </button>

            <button class="tool-button annotation-button" :class="{ active: annotationActive }" title="Annotation"
                @click="toggleAnnotation">
                T
            </button>

            <button class="tool-button" :class="{ active: regionActive }" title="Region" @click="toggleRegion">
                □
            </button>
        </aside>

        <div v-if="componentsOpen" class="component-flyout" @click.stop>
            <div class="flyout-header">
                <span>Add component</span>
            </div>

            <div class="role-list">
                <div v-for="role in roles" :key="role.type" class="role-group">
                    <button class="role-row" :class="{
                        selected:
                            selectedRole?.type === role.type,
                    }" @click="selectRole(role)">
                        <span class="role-glyph">
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
                            {{
                                selectedRole?.type === role.type
                                    ? '−'
                                    : '›'
                            }}
                        </span>
                    </button>

                    <div v-if="
                        selectedRole?.type === role.type
                    " class="technology-list">
                        <button v-for="technology in role.technologies" :key="technology" class="technology-row" @click="
                            addComponent(
                                role,
                                technology,
                            )
                            ">
                            {{ technology }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tool-system {
    position: absolute;
    left: 14px;
    top: 14px;
    z-index: 30;

    font-family:
        'IBM Plex Sans',
        system-ui,
        sans-serif;
}

.canvas-tool-rail {
    display: flex;
    flex-direction: column;
    gap: 3px;

    padding: 5px;

    background: oklch(1 0 0);

    border:
        1px solid oklch(0.895 0.008 258);

    border-radius: 12px;

    box-shadow:
        0 2px 6px oklch(0.55 0.03 258 / 0.10),
        0 14px 30px -20px oklch(0.50 0.05 258 / 0.30);
}

.tool-button {
    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: 0;
    border-radius: 8px;

    background: transparent;

    color:
        oklch(0.46 0.014 258);

    font-family: inherit;
    font-size: 14px;

    cursor: pointer;
}

.tool-button.annotation-button {
    font-size: 12px;
}

.tool-button:hover {
    background:
        oklch(0.962 0.012 258);
}

.tool-button.active {
    background:
        oklch(0.94 0.04 258);

    color:
        oklch(0.44 0.19 258);
}

.component-flyout {
    position: absolute;

    left: 58px;
    top: 0;

    width: 262px;
    max-height:
        calc(100vh - 100px);

    overflow-y: auto;

    background:
        oklch(1 0 0);

    border:
        1px solid oklch(0.895 0.008 258);

    border-radius: 12px;

    box-shadow:
        0 2px 6px oklch(0.55 0.03 258 / 0.10),
        0 18px 36px -22px oklch(0.50 0.05 258 / 0.34);

    animation:
        pop 0.13s ease-out;
}

.flyout-header {
    display: flex;
    align-items: center;
    gap: 8px;

    padding:
        11px 13px 9px;

    border-bottom:
        1px solid oklch(0.93 0.006 258);

    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;

    color:
        oklch(0.56 0.014 258);
}

.role-list {
    padding: 7px;
}

.role-group {
    width: 100%;
}

.role-row {
    width: 100%;

    display: flex;
    align-items: center;
    gap: 10px;

    padding:
        8px 9px;

    border: 0;
    border-radius: 7px;

    background: transparent;

    color:
        oklch(0.26 0.015 258);

    font: inherit;
    font-size: 11.5px;

    text-align: left;

    cursor: pointer;
}

.role-row:hover {
    background:
        oklch(0.972 0.007 258);
}

.role-row.selected {
    background:
        oklch(0.962 0.012 258);
}

.role-glyph {
    flex: none;

    width: 18px;
    height: 18px;

    display: flex;
    align-items: center;
    justify-content: center;

    color:
        oklch(0.46 0.014 258);
}

.role-label {
    flex: 1;
}

.role-chevron {
    color:
        oklch(0.62 0.012 258);

    font-size: 13px;
}

.technology-list {
    padding:
        1px 7px 6px 35px;
}

.technology-row {
    width: 100%;

    display: block;

    padding:
        6px 8px;

    border: 0;
    border-radius: 6px;

    background: transparent;

    color:
        oklch(0.43 0.014 258);

    font: inherit;
    font-size: 10.5px;

    text-align: left;

    cursor: pointer;
}

.technology-row:hover {
    background:
        oklch(0.962 0.012 258);

    color:
        oklch(0.26 0.015 258);
}

.glyph-box {
    width: 14px;
    height: 11px;

    border:
        1.4px solid currentColor;

    border-radius: 2px;
}

.glyph-database {
    position: relative;

    width: 14px;
    height: 12px;

    border:
        1.4px solid currentColor;

    border-radius:
        50% / 20%;
}

.glyph-queue {
    width: 14px;

    display: flex;
    flex-direction: column;
    gap: 2px;
}

.glyph-queue i {
    display: block;

    width: 14px;
    height: 1.5px;

    border-radius: 1px;

    background:
        currentColor;
}

.glyph-ring {
    width: 12px;
    height: 12px;

    border:
        1.4px solid currentColor;

    border-radius: 50%;
}

.glyph-external {
    width: 14px;
    height: 11px;

    border:
        1.4px dashed currentColor;

    border-radius: 2px;
}

.glyph-diamond {
    width: 10px;
    height: 10px;

    border:
        1.4px solid currentColor;

    transform:
        rotate(45deg);

    border-radius: 1px;
}

@keyframes pop {
    from {
        opacity: 0;

        transform:
            translateY(-4px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: none;
    }
}
</style>
