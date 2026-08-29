<script setup lang="ts">
import ArchitectureCanvas from './features/canvas/components/ArchitectureCanvas.vue'
import { useArchitectureStore } from './features/architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()

function addService() {
  architectureStore.execute({
    type: 'ADD_NODE',

    node: {
      id: crypto.randomUUID(),
      type: 'service',
      name: 'Core Service',

      position: {
        x: 300,
        y: 220,
      },

      metadata: {
        technology: 'go',
      },

      behavior: {},
    },
  })
}

function addDatabase() {
  architectureStore.execute({
    type: 'ADD_NODE',

    node: {
      id: crypto.randomUUID(),
      type: 'database',
      name: 'PostgreSQL',

      position: {
        x: 650,
        y: 220,
      },

      metadata: {
        technology: 'postgresql',
      },

      behavior: {},
    },
  })
}
</script>

<template>
  <div class="app">
    <header class="toolbar">
      <strong>Akitekt</strong>

      <button @click="addService">
        Add service
      </button>

      <button @click="addDatabase">
        Add PostgreSQL
      </button>

      <button
        :disabled="!architectureStore.canUndo"
        @click="architectureStore.undo"
      >
        Undo
      </button>

      <button
        :disabled="!architectureStore.canRedo"
        @click="architectureStore.redo"
      >
        Redo
      </button>
    </header>

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
}

.toolbar {
  height: 56px;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 0 16px;

  border-bottom: 1px solid #e5e7eb;
}

.workspace {
  height: calc(100vh - 56px);
}
</style>