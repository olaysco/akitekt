<script setup lang="ts">
import ArchitectureCanvas from './features/canvas/components/ArchitectureCanvas.vue'
import CanvasTabs from './features/canvas/components/CanvasTabs.vue'
import { useArchitectureStore } from './features/architectures/stores/architecture.store'
import { injectionLabel } from './features/simulation/services/create-execution-trace'
import { useSimulationStore } from './features/simulation/stores/simulation.store'
import { computed, watch } from 'vue'

const architectureStore = useArchitectureStore()
const simulationStore = useSimulationStore()

const injectionText = computed(() => {
  const injection = simulationStore.injection

  if (!injection) {
    return 'no failure injected'
  }

  const node = architectureStore.architecture.nodes.find(
    (item) => item.id === injection.nodeId,
  )

  return `${node?.name ?? injection.nodeId} · ${injectionLabel(injection.kind)}`
})

watch(
  () => architectureStore.activeDocumentId,
  () => {
    simulationStore.reset()
    simulationStore.clearInjection()
  },
)

function resetWorkspace() {
  simulationStore.reset()
  simulationStore.clearInjection()
  architectureStore.resetArchitecture()
}
</script>

<template>
  <div class="app">
    <header class="toolbar">
      <div class="identity">
        <strong class="brand">
          Akitekt
        </strong>

        <span class="divider" />

        <span class="project">
          {{ architectureStore.architecture.name }}
        </span>
      </div>

      <div class="history">
        <button :disabled="!architectureStore.canUndo" title="Undo" @click="architectureStore.undo">
          ↶
        </button>

        <button :disabled="!architectureStore.canRedo" title="Redo" @click="architectureStore.redo">
          ↷
        </button>
      </div>

      <span class="spacer" />

      <button class="injection-chip" :class="{ active: simulationStore.injection }"
        @click="simulationStore.clearInjection">
        {{ injectionText }}
      </button>

      <button class="reset" @click="resetWorkspace">
        Reset
      </button>

      <button class="run" :disabled="simulationStore.running" @click="simulationStore.run(architectureStore.architecture)">
        {{ simulationStore.running ? 'Running…' : 'Run' }}
      </button>
    </header>

    <CanvasTabs />

    <main class="workspace">
      <ArchitectureCanvas />
    </main>
  </div>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  background: oklch(0.964 0.005 258);
}

.toolbar {
  height: 50px;

  display: flex;
  align-items: center;
  gap: 16px;

  padding: 0 14px 0 16px;

  background: oklch(0.99 0.003 258);
  border-bottom: 1px solid oklch(0.905 0.007 258);
}

.identity {
  display: flex;
  align-items: baseline;
  gap: 11px;
}

.brand {
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.03em;

  color: oklch(0.22 0.016 258);
}

.divider {
  width: 1px;
  height: 13px;

  background: oklch(0.89 0.008 258);
}

.project {
  font-size: 12px;

  color: oklch(0.40 0.014 258);
}

.history {
  display: flex;
  gap: 2px;
}

.history button {
  width: 26px;
  height: 26px;

  background: transparent;
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 6px;

  color: oklch(0.36 0.014 258);
  font-family: inherit;
  font-size: 12px;

  cursor: pointer;
}

.history button:disabled {
  color: oklch(0.76 0.01 258);
  cursor: default;
}

.spacer {
  flex: 1;
}

.injection-chip {
  padding: 4px 9px;

  background: transparent;
  border: 1px solid oklch(0.91 0.006 258);
  border-radius: 5px;

  color: oklch(0.60 0.014 258);
  font-family: inherit;
  font-size: 10px;

  cursor: default;
}

.injection-chip.active {
  background: oklch(0.58 0.21 27 / 0.09);
  border-color: oklch(0.58 0.21 27 / 0.30);

  color: oklch(0.58 0.21 27);

  cursor: pointer;
}

.reset {
  padding: 6px 11px;

  background: transparent;
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 6px;

  color: oklch(0.45 0.014 258);
  font-family: inherit;
  font-size: 11px;

  cursor: pointer;
}

.run {
  padding: 6px 14px;

  background: oklch(0.60 0.19 258);
  border: 0;
  border-radius: 6px;

  color: oklch(1 0 0);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
}

.run:disabled {
  background: oklch(0.80 0.06 258);
  cursor: default;
}

.workspace {
  height: calc(100vh - 84px);
}
</style>
