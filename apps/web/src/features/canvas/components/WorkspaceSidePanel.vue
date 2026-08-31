<script setup lang="ts">
import { ref } from 'vue'

type WorkspaceTab =
    | 'architect'
    | 'patterns'
    | 'load'
    | 'review'

const activeTab =
    ref<WorkspaceTab>('architect')
</script>

<template>
    <aside class="workspace-side-panel">
        <nav class="side-tabs">
            <button :class="{ active: activeTab === 'architect' }" @click="activeTab = 'architect'">
                Architect
            </button>

            <button :class="{ active: activeTab === 'patterns' }" @click="activeTab = 'patterns'">
                Patterns
            </button>

            <button :class="{ active: activeTab === 'load' }" @click="activeTab = 'load'">
                Load
            </button>

            <button :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">
                Review
            </button>
        </nav>

        <div class="side-panel-content">
            <template v-if="activeTab === 'architect'">
                <!-- Module 2 -->
            </template>

            <template v-else-if="activeTab === 'patterns'">
                <!-- Module 7 -->
            </template>

            <template v-else-if="activeTab === 'load'">
                <!-- Module 8 -->
            </template>

            <template v-else>
                <!-- Module 6 -->
            </template>
        </div>
    </aside>
</template>

<style scoped>
.workspace-side-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 20;

    width: 320px;

    background: oklch(1 0 0);
    border-left: 1px solid oklch(0.875 0.008 258);

    font-family: 'IBM Plex Sans', sans-serif;
    color: oklch(0.25 0.015 258);
}

.side-tabs {
    display: flex;
    align-items: stretch;

    height: 44px;

    border-bottom: 1px solid oklch(0.875 0.008 258);
}

.side-tabs button {
    position: relative;

    flex: 1;

    border: 0;
    padding: 0 8px;

    background: transparent;
    color: oklch(0.48 0.015 258);

    font: inherit;
    font-size: 12px;
    font-weight: 500;

    cursor: pointer;
}

.side-tabs button:hover {
    color: oklch(0.25 0.015 258);
}

.side-tabs button.active {
    color: oklch(0.25 0.015 258);
}

.side-tabs button.active::after {
    content: '';

    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -1px;

    height: 2px;

    background: oklch(0.60 0.19 258);
}

.side-panel-content {
    height: calc(100% - 44px);
    overflow: auto;

    padding: 16px;
}
</style>