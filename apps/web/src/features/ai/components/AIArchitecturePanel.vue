<script setup lang="ts">
import { ref } from 'vue'
import type { Architecture } from '../../architectures/domain/architecture'
import type { AIArchitectureProvider } from '../domain/ai-architecture-provider'
import { useAIArchitectureProposal } from '../composables/use-ai-architecture-proposal'
import AIProposalReview from './AIProposalReview.vue'

const props = defineProps<{
  architecture: Architecture
  provider: AIArchitectureProvider
}>()

const message = ref('')
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

async function submit() {
  if (!message.value.trim()) {
    errors.value = ['Describe the architecture change you want to make.']
    return
  }

  await propose(message.value)
}
</script>

<template>
  <section class="ai-architecture-panel">
    <AIProposalReview
      v-if="proposal"
      :command="proposal"
      :errors="errors"
      @apply="applyProposal"
      @discard="discardProposal"
    />

    <form v-else class="prompt-form" @submit.prevent="submit">
      <p class="eyebrow">AI architect</p>
      <label for="architecture-prompt">What should change?</label>
      <textarea
        id="architecture-prompt"
        v-model="message"
        :disabled="isProposing"
        placeholder="Add a queue between the API and the worker."
        rows="4"
      />

      <ul v-if="errors.length" class="errors">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>

      <button class="generate" type="submit" :disabled="isProposing">
        {{ isProposing ? 'Generating…' : 'Generate proposal' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.ai-architecture-panel {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
}

.prompt-form {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.eyebrow {
  margin: 0 0 2px;
  color: oklch(0.54 0.014 258);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

label {
  color: oklch(0.3 0.015 258);
  font-size: 12px;
  font-weight: 600;
}

textarea {
  resize: vertical;
  min-height: 72px;
  border: 1px solid oklch(0.895 0.008 258);
  border-radius: 6px;
  padding: 8px;
  color: oklch(0.3 0.015 258);
  font: inherit;
  font-size: 11px;
  line-height: 1.45;
}

.errors {
  margin: 0;
  padding-left: 17px;
  color: oklch(0.52 0.18 25);
  font-size: 11px;
  line-height: 1.45;
}

.generate {
  justify-self: end;
  border: 1px solid oklch(0.5 0.18 258);
  border-radius: 6px;
  background: oklch(0.5 0.18 258);
  padding: 7px 10px;
  color: white;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.generate:disabled,
textarea:disabled {
  cursor: default;
  opacity: 0.65;
}
</style>
