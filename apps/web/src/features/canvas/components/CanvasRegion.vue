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
    <div class="canvas-region" :class="{ draft: data.draft, selected}">
        <NodeResizer
            v-if="selected && !data.draft"
            :min-width="120"
            :min-height="80"
            @resize-end="handleResizeEnd"
        />
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
    background: oklch(0.975 0.006 258 / 0.5);
    border: 1px solid oklch(0.83 0.012 258);
    border-radius: 10px;
}

.canvas-region.draft {
    background: oklch(0.96 0.025 258 / 0.32);
    border: 1px dashed oklch(0.60 0.19 258);
}

.canvas-region.selected {
  border-color: oklch(0.60 0.19 258);
}

.region-label {
    position: absolute;
    left: 10px;
    top: -8px;
    padding: 0 5px;
    background: oklch(0.964 0.005 258);
    color: oklch(0.52 0.014 258);
    font-family:  "IBM Plex Sans",  system-ui, sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.02em;
    white-space: nowrap;
}
</style>
