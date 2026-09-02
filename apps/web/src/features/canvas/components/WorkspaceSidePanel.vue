<script setup lang="ts">
import { ref } from 'vue'
import AIArchitecturePanel from '../../ai/components/AIArchitecturePanel.vue'
import { createHTTPAIArchitectureProvider } from '../../ai/services/create-http-ai-architecture-provider'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type WorkspaceTab = 'architect' | 'patterns' | 'load' | 'review'

const activeTab = ref<WorkspaceTab>('architect')
const architectureStore = useArchitectureStore()
const aiProvider = createHTTPAIArchitectureProvider({
  endpoint: '/api/ai/architecture/proposals',
})
</script>

<template>
  <aside class="workspace-side-panel">
    <nav class="side-tabs">
      <button :class="{ active: activeTab === 'architect' }" @click="activeTab = 'architect'">Architect</button>
      <button :class="{ active: activeTab === 'patterns' }" @click="activeTab = 'patterns'">Patterns</button>
      <button :class="{ active: activeTab === 'load' }" @click="activeTab = 'load'">Load</button>
      <button :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">Review</button>
    </nav>

    <div class="side-panel-content">
      <template v-if="activeTab === 'architect'">
        <AIArchitecturePanel
          :architecture="architectureStore.architecture"
          :provider="aiProvider"
        />
      </template>

      <template v-else-if="activeTab === 'patterns'">
      </template>

      <template v-else-if="activeTab === 'load'">
      </template>

      <template v-else>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.workspace-side-panel {
  position: absolute;
  top: 64px;
  right: 14px;
  bottom: 14px;
  z-index: 32;
  width: 344px;
  display: flex;
  flex-direction: column;
  background: oklch(1 0 0);
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 12px;
  box-shadow: 0 2px 6px oklch(0.55 0.03 258 / 0.10), 0 18px 36px -22px oklch(0.50 0.05 258 / 0.30);
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  color: oklch(0.25 0.015 258);
  overflow: hidden;
}

.side-tabs {
  display: flex;
  flex: none;
  padding: 5px;
  border-bottom: 1px solid oklch(0.93 0.006 258);
}

.side-tabs button {
  flex: 1;
  padding: 7px 5px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: oklch(0.52 0.014 258);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 400;
  cursor: pointer;
}

.side-tabs button:hover {
  background: oklch(0.972 0.008 258);
}

.side-tabs button.active {
  background: oklch(0.95 0.025 258);
  color: oklch(0.44 0.19 258);
  font-weight: 500;
}

.side-panel-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
