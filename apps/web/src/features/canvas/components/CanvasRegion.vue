<script setup lang="ts">
import { NodeResizer } from '@vue-flow/node-resizer'

type Props = {
  selected?: boolean

  data: {
    label: string
    draft?: boolean
  }
}

const emit = defineEmits<{
  (e: 'resizeEnd', payload: { width: number; height: number }): void
}>()

function handleResizeEnd(event: {
  params: {
    width: number
    height: number
  }
}) {
  emit('resizeEnd', {
    width: event.params.width,
    height: event.params.height,
  })
}

defineProps<Props>()
</script>

<template>
  <div class="canvas-region" :class="{ draft: data.draft, selected }">
    <NodeResizer v-if="selected && !data.draft" :min-width="120" :min-height="80" @resize-end="handleResizeEnd" />
    <div class="region-label">
      {{ data.label }}
    </div>
  </div>
</template>

<style scoped>
.canvas-region {
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  border: 1px dashed oklch(0.80 0.03 258);
  border-radius: 14px;
}

.canvas-region.draft {
  border-color: oklch(0.60 0.19 258);
  background: oklch(0.60 0.19 258 / 0.025);
}

.canvas-region.selected {
  border-color: oklch(0.60 0.19 258);
}

.region-label {
  position: absolute;
  left: 14px;
  top: -9px;
  padding: 0 8px;
  background: oklch(0.964 0.005 258);
  color: oklch(0.54 0.014 258);
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 9.5px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
