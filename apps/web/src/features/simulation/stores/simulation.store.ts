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

export const useSimulationStore = defineStore(
  'simulation',
  () => {
    const steps = ref<TraceStep[]>([])
    const completedStepIds = ref<string[]>([])
    const running = ref(false)
    const summary = ref('not run')
    const injection = ref<Injection | null>(null)

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

      steps.value = []
      completedStepIds.value = []
      running.value = false
      summary.value = 'not run'
    }

    function run(architecture: Architecture) {
      clearTimers()

      const trace = createExecutionTrace(architecture, injection.value)

      steps.value = trace.steps
      completedStepIds.value = []
      running.value = trace.steps.length > 0
      summary.value = trace.steps.length > 0 ? 'running…' : trace.summary

      trace.steps.forEach((step, index) => {
        timers.push(setTimeout(() => {
          completedStepIds.value = [...completedStepIds.value, step.id]
        }, index * stepDurationMs))
      })

      if (trace.steps.length > 0) {
        timers.push(setTimeout(() => {
          running.value = false
          summary.value = trace.summary
        }, trace.steps.length * stepDurationMs))
      }
    }

    const completedSteps = computed(() => {
      const completed = new Set(completedStepIds.value)

      return steps.value.filter((step) => completed.has(step.id))
    })

    const edgeStatus = computed(() => {
      const status: Record<string, TraceStatus> = {}

      for (const step of completedSteps.value) {
        status[step.edgeId] = step.status
      }

      return status
    })

    const nodeStatus = computed(() => {
      const status: Record<string, TraceStatus> = {}

      for (const step of completedSteps.value) {
        status[step.targetId] = step.status
      }

      return status
    })

    return {
      steps,
      completedStepIds,
      running,
      summary,
      injection,

      edgeStatus,
      nodeStatus,

      run,
      reset,
      setInjection,
      clearInjection,
    }
  },
)
