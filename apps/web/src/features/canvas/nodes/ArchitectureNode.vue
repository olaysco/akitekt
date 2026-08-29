<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

type Props = {
  data: {
    label: string
    nodeType: string
    technology?: string
  }
}

const props = defineProps<Props>()

const subtitle = computed(() => {
  return props.data.technology || props.data.nodeType
})

const iconLabel = computed(() => {
  switch (props.data.nodeType) {
    case 'service':
      return 'S'

    case 'database':
      return 'DB'

    case 'queue':
      return 'Q'

    case 'cache':
      return 'C'

    case 'worker':
      return 'W'

    case 'client':
      return 'U'

    case 'external':
      return 'EXT'

    case 'gateway':
      return 'GW'

    case 'load-balancer':
      return 'LB'

    case 'storage':
      return 'ST'

    case 'stream':
      return 'STR'

    case 'scheduler':
      return 'SCH'

    default:
      return '•'
  }
})

const nodeClass = computed(() => {
  return `node-${props.data.nodeType}`
})
</script>

<template>
  <div
    class="node-card"
    :class="nodeClass"
  >
    <Handle
      type="target"
      :position="Position.Left"
      class="handle"
    />

    <div class="node-icon">
      {{ iconLabel }}
    </div>

    <div class="node-content">
      <div class="node-label">
        {{ data.label }}
      </div>

      <div class="node-subtitle">
        {{ subtitle }}
      </div>
    </div>

    <Handle
      type="source"
      :position="Position.Right"
      class="handle"
    />
  </div>
</template>

<style scoped>
.node-card {
  --node-accent: #667085;
  --node-soft: #f3f5f8;

  min-width: 190px;
  min-height: 72px;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px 16px;

  background: white;

  border: 1px solid #d9dde5;
  border-left: 4px solid var(--node-accent);

  border-radius: 12px;

  box-shadow:
    0 1px 2px rgba(16, 24, 40, 0.04),
    0 4px 10px rgba(16, 24, 40, 0.05);

  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    transform 120ms ease;
}

.node-card:hover {
  box-shadow:
    0 2px 4px rgba(16, 24, 40, 0.06),
    0 6px 16px rgba(16, 24, 40, 0.08);
}

.node-icon {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: var(--node-soft);
  color: var(--node-accent);

  font-size: 11px;
  font-weight: 700;
}

.node-content {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 3px;
}

.node-label {
  font-size: 14px;
  font-weight: 600;

  color: #16181d;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-subtitle {
  font-size: 12px;

  color: #777f8c;

  text-transform: capitalize;
}

.handle {
  width: 9px;
  height: 9px;

  border: 2px solid white;
  background: var(--node-accent);
}

/* Node identities */

.node-service {
  --node-accent: #4f6bed;
  --node-soft: #eef2ff;
}

.node-database {
  --node-accent: #7c5ce7;
  --node-soft: #f3efff;
}

.node-queue {
  --node-accent: #d97706;
  --node-soft: #fff7e8;
}

.node-cache {
  --node-accent: #0f9f6e;
  --node-soft: #eafaf4;
}

.node-worker {
  --node-accent: #475467;
  --node-soft: #f2f4f7;
}

.node-client {
  --node-accent: #0e7490;
  --node-soft: #e9f8fb;
}

.node-external {
  --node-accent: #b54708;
  --node-soft: #fff4e5;
}

.node-gateway {
  --node-accent: #9333ea;
  --node-soft: #f7edff;
}

.node-load-balancer {
  --node-accent: #2563eb;
  --node-soft: #edf4ff;
}

.node-storage {
  --node-accent: #64748b;
  --node-soft: #f1f5f9;
}

.node-stream {
  --node-accent: #c026d3;
  --node-soft: #fdf0ff;
}

.node-scheduler {
  --node-accent: #ca8a04;
  --node-soft: #fffbe6;
}
</style>
