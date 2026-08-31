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
    <NodeInspector v-if="
      selectedNodeIds.length === 1 &&
      selectedNodeId
    " :node-id="selectedNodeId" />

    <EdgeInspector v-else-if="selectedEdgeId" :edge-id="selectedEdgeId" />

    <RegionInspector v-else-if="selectedRegionId" :region-id="selectedRegionId" />

    <div v-else-if="selectedNodeIds.length > 1" class="multi-selection-inspector">
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

  top: 64px;
  right: 14px;
  bottom: 14px;

  z-index: 32;

  width: 344px;

  background: oklch(1 0 0);

  border: 1px solid oklch(0.895 0.008 258);

  border-radius: 12px;

  box-shadow:
    0 2px 6px oklch(0.55 0.03 258 / 0.10),
    0 18px 36px -22px oklch(0.50 0.05 258 / 0.30);

  font-family:
    "IBM Plex Sans",
    system-ui,
    sans-serif;

  color: oklch(0.25 0.015 258);

  overflow-y: auto;

  overflow-x: hidden;
}

.multi-selection-inspector {
  padding: 16px;
}

.inspector-heading {
  font-size:
    9.5px;

  font-weight:
    500;

  color: oklch(0.54 0.014 258);

  text-transform: uppercase;

  letter-spacing: 0.14em;
}

.selection-count {
  margin-top:
    10px;

  font-size: 13px;

  font-weight: 600;

  color: oklch(0.24 0.016 258);
}

.selection-description {
  margin:
    5px 0 0;

  font-size: 11px;

  line-height: 1.5;

  color:
    oklch(0.52 0.014 258);
}
</style>
