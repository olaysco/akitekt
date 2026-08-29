<script setup lang="ts">
import ArchitectureCanvas from './features/canvas/components/ArchitectureCanvas.vue'
import { useArchitectureStore } from './features/architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()
</script>

<template>
  <div class="app">
    <header class="toolbar">
      <strong class="brand">
        Akitekt
      </strong>

      <div class="history">
        <button :disabled="!architectureStore.canUndo" @click="architectureStore.undo">
          Undo
        </button>

        <button :disabled="!architectureStore.canRedo" @click="architectureStore.redo">
          Redo
        </button>
      </div>
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

  background: #fafafa;
}

.toolbar {
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;

  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  font-size: 14px;
  font-weight: 600;

  color: #20232a;
}

.history {
  display: flex;
  gap: 6px;
}

.history button {
  padding: 6px 10px;

  background: white;
  border: 1px solid #e2e5e9;
  border-radius: 6px;

  font-size: 11px;

  cursor: pointer;
}

.history button:disabled {
  opacity: 0.4;
  cursor: default;
}

.workspace {
  height: calc(100vh - 52px);
}
</style>
