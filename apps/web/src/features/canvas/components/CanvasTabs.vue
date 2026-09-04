<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const architectureStore = useArchitectureStore()

const renamingId = ref<string | null>(null)
const renameInput = ref<HTMLInputElement | null>(null)

async function startRename(id: string, name: string) {
  renamingId.value = id

  await nextTick()

  renameInput.value?.focus()
  renameInput.value?.select()

  if (renameInput.value) {
    renameInput.value.value = name
  }
}

function commitRename(id: string, value: string) {
  if (renamingId.value !== id) {
    return
  }

  architectureStore.renameDocument(id, value)
  renamingId.value = null
}

function cancelRename() {
  renamingId.value = null
}
</script>

<template>
  <nav class="canvas-tabs">
    <div v-for="tab in architectureStore.tabs" :key="tab.id" class="tab"
      :class="{ active: tab.id === architectureStore.activeDocumentId }"
      @click="architectureStore.activateDocument(tab.id)" @dblclick="startRename(tab.id, tab.name)">
      <input v-if="renamingId === tab.id" ref="renameInput" class="tab-input" :value="tab.name"
        @click.stop @blur="commitRename(tab.id, ($event.target as HTMLInputElement).value)"
        @keydown.enter="($event.target as HTMLInputElement).blur()" @keydown.esc="cancelRename" />

      <span v-else class="tab-name" :title="tab.name">
        {{ tab.name }}
      </span>

      <span v-if="architectureStore.tabs.length > 1 && renamingId !== tab.id" class="close"
        @click.stop="architectureStore.closeDocument(tab.id)">
        ×
      </span>
    </div>

    <button type="button" class="add" title="New canvas" @click="architectureStore.openBlankDocument">
      +
    </button>
  </nav>
</template>

<style scoped>
.canvas-tabs {
  height: 34px;

  display: flex;
  align-items: center;
  gap: 2px;

  padding: 0 10px;

  background: oklch(0.978 0.004 258);
  border-bottom: 1px solid oklch(0.915 0.007 258);

  overflow-x: auto;
}

.tab {
  flex: none;

  display: flex;
  align-items: center;
  gap: 7px;

  max-width: 200px;
  padding: 4px 9px;

  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;

  color: oklch(0.52 0.014 258);
  font-size: 11px;

  cursor: pointer;
}

.tab:hover {
  background: oklch(0.955 0.005 258);
}

.tab.active {
  background: oklch(1 0 0);
  border-color: oklch(0.90 0.008 258);
  color: oklch(0.24 0.016 258);
  font-weight: 600;
}

.tab-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tab-input {
  width: 130px;

  background: transparent;
  border: 0;
  border-bottom: 1px solid oklch(0.72 0.12 258);

  color: inherit;
  font-family: inherit;
  font-size: 11px;
  font-weight: inherit;

  outline: none;
}

.close {
  flex: none;

  color: oklch(0.66 0.012 258);
  font-size: 12px;
  line-height: 1;
}

.close:hover {
  color: oklch(0.45 0.014 258);
}

.add {
  flex: none;

  width: 22px;
  height: 22px;

  background: transparent;
  border: 1px solid oklch(0.90 0.008 258);
  border-radius: 6px;

  color: oklch(0.45 0.014 258);
  font-family: inherit;
  font-size: 12px;

  cursor: pointer;
}
</style>
