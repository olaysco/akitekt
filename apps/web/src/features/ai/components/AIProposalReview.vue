<script setup lang="ts">
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import type { DocumentOperation } from '../../architectures/domain/operation'

defineProps<{
  command: AIArchitectureCommand
  errors?: string[]
}>()

defineEmits<{
  apply: []
  discard: []
}>()

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
  <section class="ai-proposal-review">
    <p class="eyebrow">AI proposal</p>
    <h2>{{ command.summary || command.message }}</h2>
    <p class="operation-count">
      {{ command.operations.length }} operation{{ command.operations.length === 1 ? '' : 's' }} ready to review
    </p>

    <div class="operations">
      <p class="section-label">Planned changes</p>
      <ul>
        <li v-for="operation in command.operations" :key="operation.type + operationLabel(operation)">
          <strong>{{ operation.type }}</strong>
          <span>{{ operationLabel(operation) }}</span>
        </li>
      </ul>
    </div>

    <div v-if="command.assumptions?.length" class="assumptions">
      <p class="section-label">Assumptions</p>
      <ul>
        <li v-for="assumption in command.assumptions" :key="assumption">
          {{ assumption }}
        </li>
      </ul>
    </div>

    <ul v-if="errors?.length" class="errors">
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>

    <div class="actions">
      <button class="secondary" type="button" @click="$emit('discard')">
        Discard
      </button>
      <button class="primary" type="button" @click="$emit('apply')">
        Apply proposal
      </button>
    </div>
  </section>
</template>

<style scoped>
.ai-proposal-review {
  padding: 16px;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  color: oklch(0.25 0.015 258);
}

.eyebrow,
.section-label {
  margin: 0;
  color: oklch(0.54 0.014 258);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h2 {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.35;
}

.operation-count {
  margin: 6px 0 0;
  color: oklch(0.52 0.014 258);
  font-size: 11px;
}

.assumptions {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid oklch(0.93 0.006 258);
}

.operations {
  margin-top: 18px;
}

ul {
  margin: 8px 0 0;
  padding-left: 17px;
  color: oklch(0.4 0.014 258);
  font-size: 11px;
  line-height: 1.5;
}

.operations ul {
  list-style: none;
  padding-left: 0;
}

.operations li {
  display: flex;
  gap: 7px;
  padding: 5px 0;
  border-bottom: 1px solid oklch(0.95 0.004 258);
}

.operations strong {
  color: oklch(0.44 0.19 258);
  font-size: 9px;
  font-weight: 600;
}

.operations span {
  overflow: hidden;
  color: oklch(0.42 0.014 258);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.errors {
  margin: 16px 0 0;
  padding: 9px 9px 9px 25px;
  border-radius: 6px;
  background: oklch(0.97 0.025 25);
  color: oklch(0.46 0.16 25);
  font-size: 11px;
  line-height: 1.45;
}

button {
  border-radius: 6px;
  padding: 7px 10px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.secondary {
  border: 1px solid oklch(0.895 0.008 258);
  background: oklch(1 0 0);
  color: oklch(0.42 0.014 258);
}

.primary {
  border: 1px solid oklch(0.5 0.18 258);
  background: oklch(0.5 0.18 258);
  color: white;
}
</style>
