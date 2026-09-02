<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { Architecture } from '../../architectures/domain/architecture'
import type { AIArchitectureCommand } from '../domain/ai-architecture-command'
import type { AIArchitectureProvider } from '../domain/ai-architecture-provider'
import { useAIArchitectureProposal } from '../composables/use-ai-architecture-proposal'
import AIProposalReview from './AIProposalReview.vue'

type ProposalStatus = 'pending' | 'applied' | 'discarded'

type Entry = {
  id: string
  role: 'user' | 'assistant'
  text: string
  command: AIArchitectureCommand | null
  status: ProposalStatus
}

const props = defineProps<{
  architecture: Architecture
  provider: AIArchitectureProvider
}>()

const message = ref('')
const entries = ref<Entry[]>([])
const transcript = ref<HTMLElement | null>(null)

const {
  proposal,
  errors,
  isProposing,
  propose,
  applyProposal,
  discardProposal,
} = useAIArchitectureProposal({
  provider: props.provider,
  getArchitecture: () => props.architecture,
})

const suggestions = [
  'Design a simple notification system',
  'Put a cache in front of the database',
]

function addEntry(entry: Omit<Entry, 'id'>) {
  entries.value.push({
    id: crypto.randomUUID(),
    ...entry,
  })

  scrollToLatest()
}

async function scrollToLatest() {
  await nextTick()

  if (!transcript.value) return

  transcript.value.scrollTop = transcript.value.scrollHeight
}

async function send(text: string) {
  const request = text.trim()

  if (!request || isProposing.value) {
    return
  }

  message.value = ''

  addEntry({
    role: 'user',
    text: request,
    command: null,
    status: 'pending',
  })

  await propose(request)

  if (!proposal.value) return

  addEntry({
    role: 'assistant',
    text: proposal.value.summary || proposal.value.message,
    command: proposal.value,
    status: 'pending',
  })
}

function resolvePending(status: ProposalStatus) {
  for (let index = entries.value.length - 1; index >= 0; index -= 1) {
    const entry = entries.value[index]

    if (entry.command && entry.status === 'pending') {
      entry.status = status
      return
    }
  }
}

function apply() {
  const result = applyProposal()

  if (result.applied) {
    resolvePending('applied')
  }
}

function discard() {
  discardProposal()
  resolvePending('discarded')
}
</script>

<template>
  <section class="ai-architecture-panel">
    <div ref="transcript" class="transcript">
      <p v-if="!entries.length" class="transcript-placeholder">
        Describe the system the way you would explain it to another engineer. Every change comes back as graph
        operations you can review before they land.
      </p>

      <template v-for="entry in entries" :key="entry.id">
        <div v-if="entry.role === 'user'" class="user-message">
          {{ entry.text }}
        </div>

        <div v-else class="assistant-message">
          <p class="assistant-text">
            {{ entry.text }}
          </p>

          <AIProposalReview v-if="entry.command" :command="entry.command" :status="entry.status" @apply="apply"
            @discard="discard" />
        </div>
      </template>

      <p v-if="isProposing" class="thinking">
        Working through the graph…
      </p>
    </div>

    <div class="composer">
      <ul v-if="errors.length" class="errors">
        <li v-for="error in errors" :key="error">
          {{ error }}
        </li>
      </ul>

      <div class="suggestions">
        <button v-for="suggestion in suggestions" :key="suggestion" type="button" :disabled="isProposing"
          @click="send(suggestion)">
          {{ suggestion }}
        </button>
      </div>

      <div class="prompt-row">
        <input v-model="message" :disabled="isProposing" placeholder="Describe or change the architecture…"
          @keydown.enter="send(message)" />

        <button class="send" type="button" :disabled="isProposing" @click="send(message)">
          ↵
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-architecture-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
}

.transcript {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  padding: 13px;
  overflow-y: auto;
}

.transcript-placeholder {
  margin: 0;
  color: oklch(0.55 0.014 258);
  font-size: 11.5px;
  line-height: 1.55;
  text-wrap: pretty;
}

.user-message {
  align-self: flex-end;
  max-width: 94%;
  padding: 9px 11px;
  background: oklch(0.955 0.018 258);
  border: 1px solid oklch(0.885 0.02 258);
  border-radius: 10px 10px 3px 10px;
  color: oklch(0.27 0.015 258);
  font-size: 12px;
  line-height: 1.55;
  text-wrap: pretty;
}

.assistant-message {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assistant-text {
  margin: 0;
  color: oklch(0.34 0.014 258);
  font-size: 12px;
  line-height: 1.6;
  text-wrap: pretty;
}

.thinking {
  margin: 0;
  color: oklch(0.58 0.014 258);
  font-size: 11.5px;
}

.composer {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 8px;
  padding: 9px 13px 12px;
  border-top: 1px solid oklch(0.93 0.006 258);
}

.errors {
  margin: 0;
  padding: 8px 10px 8px 24px;
  border-radius: 7px;
  background: oklch(0.97 0.025 27);
  color: oklch(0.50 0.17 27);
  font-size: 10.5px;
  line-height: 1.45;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suggestions button {
  padding: 5px 9px;
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 14px;
  background: oklch(0.972 0.005 258);
  color: oklch(0.34 0.014 258);
  font: inherit;
  font-size: 10.5px;
  text-align: left;
  cursor: pointer;
}

.suggestions button:hover:not(:disabled) {
  border-color: oklch(0.72 0.12 258);
}

.prompt-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid oklch(0.885 0.009 258);
  border-radius: 8px;
  background: oklch(0.978 0.004 258);
}

.prompt-row:focus-within {
  border-color: oklch(0.60 0.19 258);
}

.prompt-row input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: oklch(0.27 0.015 258);
  font: inherit;
  font-size: 11.5px;
  outline: none;
}

.send {
  flex: none;
  padding: 0;
  border: 0;
  background: transparent;
  color: oklch(0.60 0.19 258);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

button:disabled,
input:disabled {
  cursor: default;
  opacity: 0.6;
}
</style>
