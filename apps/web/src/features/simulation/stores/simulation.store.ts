import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Architecture } from '../../architectures/domain/architecture'
import {
  createExecutionTrace,
  type Injection,
  type InjectionKind,
  type TraceStatus,
  type TraceStep,
} from '../services/create-execution-trace'

const stepDurationMs = 420

type Lane = {
  steps: TraceStep[]
  completedStepIds: string[]
  summary: string
}

function emptyLane(): Lane {
  return {
    steps: [],
    completedStepIds: [],
    summary: 'not run',
  }
}

function statusMap(
  lane: Lane,
  key: 'edgeId' | 'targetId',
): Record<string, TraceStatus> {
  const completed = new Set(lane.completedStepIds)
  const status: Record<string, TraceStatus> = {}

  for (const step of lane.steps) {
    if (completed.has(step.id)) {
      status[step[key]] = step.status
    }
  }

  return status
}

export const useSimulationStore = defineStore(
  'simulation',
  () => {
    const laneA = ref<Lane>(emptyLane())
    const laneB = ref<Lane | null>(null)
    const running = ref(false)
    const injection = ref<Injection | null>(null)
    const speed = ref(1)

    let timers: ReturnType<typeof setTimeout>[] = []

    function clearTimers() {
      timers.forEach(clearTimeout)
      timers = []
    }

    function setInjection(nodeId: string, kind: InjectionKind) {
      injection.value =
        injection.value?.nodeId === nodeId && injection.value.kind === kind
          ? null
          : { nodeId, kind }
    }

    function clearInjection() {
      injection.value = null
    }

    function reset() {
      clearTimers()

      laneA.value = emptyLane()
      laneB.value = null
      running.value = false
    }

    function play(lane: Lane, steps: TraceStep[], summary: string) {
      const interval = stepDurationMs / speed.value

      steps.forEach((step, index) => {
        timers.push(setTimeout(() => {
          lane.completedStepIds = [...lane.completedStepIds, step.id]
        }, index * interval))
      })

      timers.push(setTimeout(() => {
        lane.summary = summary
      }, steps.length * interval))
    }

    function run(
      architecture: Architecture,
      compareArchitecture: Architecture | null = null,
    ) {
      clearTimers()

      const traceA = createExecutionTrace(architecture, injection.value)
      const traceB = compareArchitecture
        ? createExecutionTrace(compareArchitecture, injection.value)
        : null

      laneA.value = {
        steps: traceA.steps,
        completedStepIds: [],
        summary: traceA.steps.length > 0 ? 'running…' : traceA.summary,
      }

      laneB.value = traceB
        ? {
            steps: traceB.steps,
            completedStepIds: [],
            summary: traceB.steps.length > 0 ? 'running…' : traceB.summary,
          }
        : null

      const longest = Math.max(
        traceA.steps.length,
        traceB?.steps.length ?? 0,
      )

      running.value = longest > 0

      play(laneA.value, traceA.steps, traceA.summary)

      if (traceB && laneB.value) {
        play(laneB.value, traceB.steps, traceB.summary)
      }

      if (longest > 0) {
        timers.push(setTimeout(() => {
          running.value = false
        }, (longest * stepDurationMs) / speed.value))
      }
    }

    const steps = computed(() => laneA.value.steps)
    const completedStepIds = computed(() => laneA.value.completedStepIds)
    const summary = computed(() => laneA.value.summary)

    const stepsB = computed(() => laneB.value?.steps ?? [])
    const completedStepIdsB = computed(() => laneB.value?.completedStepIds ?? [])
    const summaryB = computed(() => laneB.value?.summary ?? 'not run')

    const edgeStatus = computed(() => statusMap(laneA.value, 'edgeId'))
    const nodeStatus = computed(() => statusMap(laneA.value, 'targetId'))

    const edgeStatusB = computed(() =>
      laneB.value ? statusMap(laneB.value, 'edgeId') : {},
    )
    const nodeStatusB = computed(() =>
      laneB.value ? statusMap(laneB.value, 'targetId') : {},
    )

    return {
      steps,
      completedStepIds,
      summary,

      stepsB,
      completedStepIdsB,
      summaryB,

      running,
      injection,
      speed,

      edgeStatus,
      nodeStatus,
      edgeStatusB,
      nodeStatusB,

      run,
      reset,
      setInjection,
      clearInjection,
    }
  },
)
