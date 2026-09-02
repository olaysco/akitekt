<script setup lang="ts">
import { computed, ref } from 'vue'
import AIArchitecturePanel from '../../ai/components/AIArchitecturePanel.vue'
import { createHTTPAIArchitectureProvider } from '../../ai/services/create-http-ai-architecture-provider'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'
import { patternGroups } from '../../patterns/domain/pattern'

type WorkspaceTab = 'architect' | 'patterns' | 'load' | 'review'

type Tone = 'ok' | 'warn' | 'fail'

type CapacityRow = {
  id: string
  label: string
  value: string
  tone: Tone
}

type Severity = 'high' | 'med' | 'low'

type Concern = {
  id: string
  severity: Severity
  component: string
  text: string
}

const activeTab = ref<WorkspaceTab>('architect')
const architectureStore = useArchitectureStore()
const apiBaseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
const aiProvider = createHTTPAIArchitectureProvider({
  endpoint: `${apiBaseURL}/api/ai/architecture/proposals`,
})

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: 'architect', label: 'Architect' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'load', label: 'Load' },
  { id: 'review', label: 'Review' },
]

const offeredLoad = ref(60000)
const consumerInstances = ref(10)

const architecture = computed(
  () => architectureStore.architecture,
)

function formatPerMinute(value: number): string {
  if (value < 1000) {
    return `${Math.round(value)} / min`
  }

  const thousands = value / 1000

  return `${
    Number.isInteger(thousands)
      ? thousands
      : thousands.toFixed(1)
  } k / min`
}

function ceilingPerMinute(
  requestsPerSecond: number | undefined,
  instances: number,
): number | null {
  if (
    requestsPerSecond === undefined ||
    !Number.isFinite(requestsPerSecond)
  ) {
    return null
  }

  return requestsPerSecond * 60 * instances
}

const capacityRows = computed<CapacityRow[]>(() => {
  const rows: CapacityRow[] = []

  for (const node of architecture.value.nodes) {
    const isConsumer = node.type === 'worker'

    const ceiling = ceilingPerMinute(
      node.behavior.capacity?.requestsPerSecond,
      isConsumer
        ? consumerInstances.value
        : node.metadata.instances ?? 1,
    )

    if (ceiling === null) continue

    rows.push({
      id: node.id,
      label: isConsumer
        ? `${node.name} capacity`
        : `${node.name} ceiling`,
      value: formatPerMinute(ceiling),
      tone: offeredLoad.value > ceiling ? 'fail' : 'ok',
    })
  }

  return rows
})

const concerns = computed<Concern[]>(() => {
  const found: Concern[] = []

  const order: Severity[] = ['high', 'med', 'low']

  return found.sort(
    (a, b) =>
      order.indexOf(a.severity) -
      order.indexOf(b.severity),
  )
})
</script>

<template>
  <aside class="workspace-side-panel">
    <nav class="side-tabs">
      <button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </nav>

    <template v-if="activeTab === 'architect'">
      <AIArchitecturePanel :architecture="architectureStore.architecture" :provider="aiProvider" />
    </template>

    <template v-else-if="activeTab === 'patterns'">
      <div class="tab-body scrollable pattern-list">
        <template v-for="group in patternGroups" :key="group.id">
          <div class="group-title">
            {{ group.title }}
          </div>

          <div v-for="pattern in group.patterns" :key="pattern.id" class="pattern-row">
            <span class="pattern-name">
              {{ pattern.name }}
            </span>

            <span class="tag" :class="pattern.status">
              {{ pattern.status }}
            </span>
          </div>
        </template>
      </div>

      <p class="tab-note">
        Each one loads onto this canvas as a runnable architecture with a scenario attached.
      </p>
    </template>

    <template v-else-if="activeTab === 'load'">
      <div class="tab-body scrollable load-controls">
        <div class="slider-block">
          <div class="slider-header">
            <span class="eyebrow">Offered load</span>

            <span class="slider-value">
              {{ formatPerMinute(offeredLoad) }}
            </span>
          </div>

          <input v-model.number="offeredLoad" type="range" min="10000" max="200000" step="5000" />

          <div class="slider-bounds">
            <span>10 k / min</span>
            <span>200 k / min</span>
          </div>
        </div>

        <div class="slider-block">
          <div class="slider-header">
            <span class="eyebrow">Consumer instances</span>

            <span class="slider-value">
              {{ consumerInstances }}
            </span>
          </div>

          <input v-model.number="consumerInstances" type="range" min="2" max="60" step="2" />
        </div>

        <div class="derived-card">
          <div class="derived-header">
            derived capacity
          </div>

          <div v-for="row in capacityRows" :key="row.id" class="derived-row">
            <span class="derived-label">
              {{ row.label }}
            </span>

            <span class="pill" :class="row.tone">
              {{ row.value }}
            </span>
          </div>

          <p v-if="!capacityRows.length" class="derived-empty">
            No component declares a capacity yet. Set requests per second on a component to derive its ceiling.
          </p>
        </div>

        <p class="tab-note inline">
          An architecture reasoning simulator, not a load test. Capacity comes from properties on the graph.
        </p>
      </div>
    </template>

    <template v-else>
      <div class="tab-body scrollable">
        <div class="concerns-header">
          <span class="eyebrow">Concerns</span>

          <span class="concerns-count">
            {{ concerns.length }} found
          </span>
        </div>

        <div v-for="concern in concerns" :key="concern.id" class="concern-row">
          <div class="concern-meta">
            <span class="severity" :class="concern.severity">
              {{ concern.severity.toUpperCase() }}
            </span>

            <span class="concern-component">
              {{ concern.component }}
            </span>
          </div>

          <p class="concern-text">
            {{ concern.text }}
          </p>
        </div>

        <p v-if="!concerns.length" class="concerns-empty">
          Nothing to raise.
        </p>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.workspace-side-panel {
  position: absolute;
  top: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 32;
  width: 344px;
  display: flex;
  flex-direction: column;
  background: oklch(1 0 0);
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 12px;
  box-shadow: 0 2px 6px oklch(0.55 0.03 258 / 0.10), 0 18px 36px -22px oklch(0.50 0.05 258 / 0.30);
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  color: oklch(0.25 0.015 258);
  overflow: hidden;
}

.side-tabs {
  display: flex;
  flex: none;
  align-items: center;
  gap: 2px;
  padding: 7px 8px;
  border-bottom: 1px solid oklch(0.93 0.006 258);
}

.side-tabs button {
  flex: 1;
  padding: 7px 4px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: oklch(0.52 0.014 258);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 400;
  cursor: pointer;
}

.side-tabs button:hover {
  background: oklch(0.972 0.008 258);
}

.side-tabs button.active {
  background: oklch(0.95 0.025 258);
  color: oklch(0.44 0.19 258);
  font-weight: 600;
}

.tab-body {
  flex: 1;
  min-height: 0;
}

.scrollable {
  overflow-y: auto;
}

.eyebrow {
  color: oklch(0.58 0.014 258);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tab-note {
  flex: none;
  margin: 0;
  padding: 11px 13px;
  border-top: 1px solid oklch(0.93 0.006 258);
  color: oklch(0.50 0.014 258);
  font-size: 10.5px;
  line-height: 1.55;
  text-wrap: pretty;
}

.tab-note.inline {
  padding: 0;
  border-top: 0;
}

.pattern-list {
  padding-bottom: 6px;
}

.group-title {
  padding: 12px 13px 4px;
  color: oklch(0.58 0.014 258);
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.pattern-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border-left: 2px solid transparent;
  color: oklch(0.42 0.014 258);
}

.pattern-name {
  flex: 1;
  font-size: 12px;
}

.tag {
  flex: none;
  padding: 2px 6px;
  border-radius: 4px;
  background: oklch(0.958 0.005 258);
  color: oklch(0.62 0.012 258);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tag.runnable,
.tag.lesson {
  background: oklch(0.94 0.04 258);
  color: oklch(0.44 0.19 258);
}

.load-controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 15px 13px;
}

.slider-block {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.slider-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.slider-header .eyebrow {
  flex: 1;
}

.slider-value {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.slider-block input[type="range"] {
  width: 100%;
  accent-color: oklch(0.60 0.19 258);
}

.slider-bounds {
  display: flex;
  justify-content: space-between;
  color: oklch(0.64 0.012 258);
  font-size: 9.5px;
}

.derived-card {
  flex: none;
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 9px;
  overflow: hidden;
}

.derived-header {
  padding: 7px 11px;
  border-bottom: 1px solid oklch(0.93 0.006 258);
  color: oklch(0.58 0.014 258);
  font-size: 8.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.derived-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 11px;
  border-top: 1px solid oklch(0.955 0.005 258);
}

.derived-row:first-of-type {
  border-top: 0;
}

.derived-label {
  flex: 1;
  color: oklch(0.42 0.014 258);
  font-size: 11.5px;
}

.derived-empty {
  margin: 0;
  padding: 10px 11px;
  color: oklch(0.55 0.014 258);
  font-size: 10.5px;
  line-height: 1.5;
  text-wrap: pretty;
}

.pill {
  flex: none;
  padding: 3px 7px;
  border-radius: 5px;
  font-size: 11px;
}

.pill.ok {
  background: oklch(0.58 0.15 152 / 0.11);
  color: oklch(0.58 0.15 152);
}

.pill.warn {
  background: oklch(0.68 0.16 68 / 0.11);
  color: oklch(0.68 0.16 68);
}

.pill.fail {
  background: oklch(0.58 0.21 27 / 0.11);
  color: oklch(0.58 0.21 27);
}

.concerns-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 13px 4px;
}

.concerns-header .eyebrow {
  flex: 1;
  letter-spacing: 0.14em;
}

.concerns-count {
  color: oklch(0.64 0.012 258);
  font-size: 9.5px;
}

.concern-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 13px;
  border-top: 1px solid oklch(0.955 0.005 258);
}

.concern-meta {
  display: flex;
  align-items: center;
  gap: 7px;
}

.severity {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8.5px;
  letter-spacing: 0.1em;
}

.severity.high {
  background: oklch(0.58 0.21 27 / 0.12);
  color: oklch(0.58 0.21 27);
}

.severity.med {
  background: oklch(0.68 0.16 68 / 0.12);
  color: oklch(0.68 0.16 68);
}

.severity.low {
  background: oklch(0.55 0.014 258 / 0.12);
  color: oklch(0.55 0.014 258);
}

.concern-component {
  color: oklch(0.62 0.012 258);
  font-size: 9px;
}

.concern-text {
  margin: 0;
  color: oklch(0.32 0.014 258);
  font-size: 11.5px;
  line-height: 1.5;
  text-wrap: pretty;
}

.concerns-empty {
  margin: 0;
  padding: 10px 13px;
  color: oklch(0.55 0.014 258);
  font-size: 10.5px;
  line-height: 1.55;
  text-wrap: pretty;
}
</style>
