<script setup lang="ts">
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import type { DocumentOperation } from '../../architectures/domain/operation'

type ProposalStatus = 'pending' | 'applied' | 'discarded'

defineProps<{
  command: AIArchitectureCommand
  status: ProposalStatus
}>()

defineEmits<{
  apply: []
  discard: []
}>()

const statusLabel: Record<ProposalStatus, string> = {
  pending: 'proposed',
  applied: 'applied',
  discarded: 'discarded',
}

function operationLabel(operation: DocumentOperation) {
  switch (operation.type) {
    case 'ADD_NODE':
      return operation.node.name
    case 'ADD_EDGE':
      return `${operation.edge.source.nodeId} → ${operation.edge.target.nodeId}`
    case 'ADD_REGION':
      return operation.region.name
    case 'ADD_ANNOTATION':
      return operation.annotation.text
    case 'COMPOSITE':
      return `${operation.operations.length} nested operations`
    case 'UPDATE_NODE':
    case 'REMOVE_NODE':
    case 'MOVE_NODE':
    case 'RESIZE_NODE':
      return operation.nodeId
    case 'UPDATE_EDGE':
    case 'REMOVE_EDGE':
      return operation.edgeId
    case 'UPDATE_REGION':
    case 'REMOVE_REGION':
    case 'MOVE_REGION':
    case 'RESIZE_REGION':
      return operation.regionId
    case 'UPDATE_ANNOTATION':
    case 'REMOVE_ANNOTATION':
      return operation.annotationId
  }
}
</script>

<template>
  <div class="ai-proposal-review" :class="status">
    <div class="operations-header">
      graph operations · {{ statusLabel[status] }}
    </div>

    <div v-for="(operation, index) in command.operations" :key="`${operation.type}-${index}`" class="operation-row">
      <span class="operation-type">
        {{ operation.type }}
      </span>

      <span class="operation-label">
        {{ operationLabel(operation) }}
      </span>
    </div>

    <div v-if="command.assumptions?.length" class="assumptions">
      <div class="assumptions-title">Assumptions</div>

      <p v-for="assumption in command.assumptions" :key="assumption" class="assumption">
        {{ assumption }}
      </p>
    </div>

    <div v-if="status === 'pending'" class="actions">
      <button class="secondary" type="button" @click="$emit('discard')">
        Discard
      </button>

      <button class="primary" type="button" @click="$emit('apply')">
        Apply
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-proposal-review {
  overflow: hidden;
  border: 1px solid oklch(0.905 0.008 258);
  border-radius: 8px;
  background: oklch(0.978 0.004 258);
}

.ai-proposal-review.discarded {
  opacity: 0.6;
}

.operations-header {
  padding: 6px 10px;
  border-bottom: 1px solid oklch(0.93 0.006 258);
  color: oklch(0.58 0.014 258);
  font-size: 8.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.operation-row {
  display: flex;
  gap: 8px;
  padding: 5px 10px;
  border-top: 1px solid oklch(0.955 0.005 258);
  font-size: 10px;
  line-height: 1.4;
}

.operation-row:first-of-type {
  border-top: 0;
}

.operation-type {
  flex: none;
  color: oklch(0.52 0.18 258);
}

.operation-label {
  overflow: hidden;
  color: oklch(0.42 0.014 258);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assumptions {
  padding: 7px 10px 8px;
  border-top: 1px solid oklch(0.93 0.006 258);
}

.assumptions-title {
  color: oklch(0.58 0.014 258);
  font-size: 8.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.assumption {
  margin: 4px 0 0;
  color: oklch(0.44 0.014 258);
  font-size: 10.5px;
  line-height: 1.45;
  text-wrap: pretty;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid oklch(0.93 0.006 258);
}

button {
  border-radius: 6px;
  padding: 5px 10px;
  font: inherit;
  font-size: 10.5px;
  cursor: pointer;
}

.secondary {
  border: 1px solid oklch(0.895 0.008 258);
  background: oklch(1 0 0);
  color: oklch(0.42 0.014 258);
}

.secondary:hover {
  border-color: oklch(0.80 0.012 258);
}

.primary {
  border: 1px solid oklch(0.60 0.19 258);
  background: oklch(0.60 0.19 258);
  color: oklch(1 0 0);
  font-weight: 600;
}
</style>
