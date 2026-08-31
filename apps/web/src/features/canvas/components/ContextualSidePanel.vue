<script setup lang="ts">
import NodeInspector from './NodeInspector.vue'
import EdgeInspector from './EdgeInspector.vue'
import RegionInspector from './RegionInspector.vue'

defineProps<{
  selectedNodeId: string | null
  selectedNodeIds: string[]
  selectedEdgeId: string | null
  selectedRegionId: string | null
}>()
</script>

<template>
  <aside class="contextual-side-panel">
    <NodeInspector
      v-if="
        selectedNodeIds.length === 1 &&
        selectedNodeId
      "
      :node-id="selectedNodeId"
    />

    <EdgeInspector
      v-else-if="selectedEdgeId"
      :edge-id="selectedEdgeId"
    />

    <RegionInspector
      v-else-if="selectedRegionId"
      :region-id="selectedRegionId"
    />

    <div
      v-else-if="selectedNodeIds.length > 1"
      class="multi-selection-inspector"
    >
      <div class="inspector-heading">
        Selection
      </div>

      <div class="selection-count">
        {{ selectedNodeIds.length }}
        components selected
      </div>

      <p class="selection-description">
        Move, duplicate or delete the
        selected components together.
      </p>
    </div>
  </aside>
</template>

<style scoped>
.contextual-side-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;

  width: 320px;

  background: oklch(1 0 0);
  border-left:
    1px solid oklch(0.875 0.008 258);

  font-family: 'IBM Plex Sans', sans-serif;
  color: oklch(0.25 0.015 258);

  overflow-y: auto;
}

.multi-selection-inspector {
  padding: 16px;
}

.inspector-heading {
  font-size: 11px;
  font-weight: 600;

  color: oklch(0.48 0.015 258);

  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.selection-count {
  margin-top: 8px;

  font-size: 14px;
  font-weight: 600;
}

.selection-description {
  margin: 6px 0 0;

  font-size: 12px;
  line-height: 1.5;

  color: oklch(0.48 0.015 258);
}
</style>
