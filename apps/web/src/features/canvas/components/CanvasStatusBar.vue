<script setup lang="ts">
import { computed } from 'vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'
import { useSimulationStore } from '../../simulation/stores/simulation.store'

defineProps<{
  zoom: number
}>()

defineEmits<{
  fit: []
}>()

const simulationStore = useSimulationStore()
const architectureStore = useArchitectureStore()

function toneFor(summary: string) {
  if (summary.startsWith('FAILED')) return 'fail'
  if (summary.startsWith('DEGRADED')) return 'warn'
  if (summary.startsWith('OK')) return 'ok'

  return 'idle'
}

const summaryTone = computed(() => toneFor(simulationStore.summary))
const summaryToneB = computed(() => toneFor(simulationStore.summaryB))

const comparing = computed(() => architectureStore.compareArchitecture !== null)

function isComplete(stepId: string): boolean {
  return simulationStore.completedStepIds.includes(stepId)
}

function isCompleteB(stepId: string): boolean {
  return simulationStore.completedStepIdsB.includes(stepId)
}
</script>

<template>
  <div class="canvas-status-bar">
    <div class="status-header">
      <span class="eyebrow">
        Execution Trace
      </span>

      <span class="spacer" />

      <span class="zoom">
        {{ Math.round(zoom * 100) }} %
      </span>

      <button type="button" @click="$emit('fit')">
        fit
      </button>

      <span class="summary" :class="summaryTone">
        {{ simulationStore.summary }}
      </span>

      <span v-if="comparing" class="summary" :class="summaryToneB">
        {{ simulationStore.summaryB }}
      </span>
    </div>

    <div v-if="simulationStore.steps.length" class="lane">
      <span v-if="comparing" class="lane-label">A</span>

      <div class="trace">
        <div v-for="step in simulationStore.steps" :key="step.id" class="step"
          :class="[step.status, { pending: !isComplete(step.id) }]">
          <span class="step-time">
            {{ step.time }}
          </span>

          <span class="step-label">
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="comparing && simulationStore.stepsB.length" class="lane">
      <span class="lane-label">B</span>

      <div class="trace">
        <div v-for="step in simulationStore.stepsB" :key="step.id" class="step"
          :class="[step.status, { pending: !isCompleteB(step.id) }]">
          <span class="step-time">
            {{ step.time }}
          </span>

          <span class="step-label">
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas-status-bar {
  position: absolute;
  left: 14px;
  right: 372px;
  bottom: 14px;
  z-index: 29;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 9px 12px 10px;
  background: oklch(1 0 0 / 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 11px;
  box-shadow: 0 2px 6px oklch(0.55 0.03 258 / 0.08);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eyebrow {
  color: oklch(0.58 0.014 258);
  font-size: 8.5px;
  letter-spacing: 0.15em;
}

.spacer {
  flex: 1;
}

.zoom {
  color: oklch(0.62 0.012 258);
  font-size: 10px;
}

.status-header button {
  padding: 3px 8px;
  background: transparent;
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 5px;
  color: oklch(0.45 0.014 258);
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
}

.summary {
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 10px;
}

.summary.idle {
  color: oklch(0.60 0.014 258);
}

.summary.ok {
  background: oklch(0.58 0.15 152 / 0.11);
  color: oklch(0.58 0.15 152);
}

.summary.warn {
  background: oklch(0.68 0.16 68 / 0.11);
  color: oklch(0.68 0.16 68);
}

.summary.fail {
  background: oklch(0.58 0.21 27 / 0.11);
  color: oklch(0.58 0.21 27);
}

.lane {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lane-label {
  flex: none;
  width: 14px;

  color: oklch(0.50 0.014 258);
  font-size: 9px;
}

.trace {
  flex: 1;
  display: flex;
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 1px;
}

.step {
  flex: none;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid oklch(0.91 0.006 258);
  border-radius: 6px;
  background: oklch(0.978 0.004 258);
  color: oklch(0.34 0.014 258);
}

.step.pending {
  opacity: 0.4;
}

.step.ok {
  border-color: oklch(0.58 0.15 152 / 0.35);
}

.step.warn {
  border-color: oklch(0.68 0.16 68 / 0.40);
}

.step.fail {
  border-color: oklch(0.58 0.21 27 / 0.40);
}

.step-time {
  font-size: 8.5px;
  opacity: 0.6;
}

.step-label {
  font-size: 10px;
  white-space: nowrap;
}
</style>
