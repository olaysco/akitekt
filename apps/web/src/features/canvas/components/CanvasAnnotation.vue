<script setup lang="ts">
import {
    nextTick,
    onMounted,
    ref,
} from 'vue'

type Props = {
    data: {
        text: string
        editing?: boolean
    }
    selected?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    commit: [text: string]
}>()

const draft = ref(props.data.text)
const textarea = ref<HTMLTextAreaElement | null>(
    null,
)

function commit() {
    const text = draft.value.trim()

    if (!text) {
        return
    }

    emit('commit', text)
}

function handleKeydown(
    event: KeyboardEvent,
) {
    if (
        event.key === 'Enter' &&
        !event.shiftKey
    ) {
        event.preventDefault()

        commit()

        textarea.value?.blur()
    }

    if (event.key === 'Escape') {
        textarea.value?.blur()
    }
}

onMounted(async () => {
    if (!props.data.editing) {
        return
    }

    await nextTick()

    textarea.value?.focus()
    textarea.value?.select()
})
</script>

<template>
    <div class="canvas-annotation" :class="{ selected }">
        <textarea v-if="data.editing" ref="textarea" v-model="draft" rows="2" class="nodrag" @blur="commit" @click.stop
            @mousedown.stop @keydown="handleKeydown" />
        <div v-else class="annotation-text">{{ data.text }} </div>
    </div>
</template>

<style scoped>
.canvas-annotation {
    width: 270px;

    padding: 10px 12px;

    background:
        oklch(1 0 0);

    border:
        1px solid oklch(0.885 0.02 258);

    border-radius:
        9px;

    box-shadow:
        0 2px 4px oklch(0.55 0.03 258 / 0.10),
        0 16px 34px -20px oklch(0.50 0.05 258 / 0.34);

    font-family:
        "IBM Plex Sans",
        system-ui,
        sans-serif;
}

.annotation-text {
    color:
        oklch(0.34 0.014 258);

    font-size:
        11px;

    line-height:
        1.5;

    white-space:
        pre-wrap;

    word-break:
        break-word;
}

textarea {
    width:
        100%;

    min-height:
        42px;

    display:
        block;

    resize:
        none;

    padding:
        0;

    background:
        transparent;

    border:
        0;

    color:
        oklch(0.34 0.014 258);

    font:
        inherit;

    font-size:
        11px;

    line-height:
        1.5;

    outline:
        none;

    overflow:
        hidden;
}

.canvas-annotation:has(textarea) {
    border-color:
        oklch(0.60 0.19 258);

    box-shadow:
        0 0 0 2px oklch(0.60 0.19 258 / 0.11),
        0 16px 34px -20px oklch(0.50 0.05 258 / 0.34);
}

.canvas-annotation.selected {
  border-color: oklch(0.60 0.19 258);
  box-shadow: 0 0 0 2px oklch(0.60 0.19 258 / 0.11), 0 16px 34px -20px oklch(0.50 0.05 258 / 0.34);
}
</style>
