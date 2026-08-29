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
    <div class="canvas-annotation">
        <textarea v-if="data.editing" ref="textarea" v-model="draft" rows="2" class="nodrag" @blur="commit" @click.stop
            @mousedown.stop @keydown="handleKeydown" />
        <div v-else class="annotation-text">{{ data.text }} </div>
    </div>
</template>

<style scoped>
.canvas-annotation {
    width: 220px;

    font-family:
        "IBM Plex Sans",
        system-ui,
        sans-serif;
}

textarea {
    width: 100%;
    min-height: 48px;

    display: block;

    resize: none;

    padding: 7px 8px;

    background:
        transparent;

    border:
        1px solid transparent;

    border-radius: 6px;

    color:
        oklch(0.34 0.014 258);

    font: inherit;
    font-size: 12px;
    line-height: 1.5;

    outline: none;

    overflow: hidden;
}

textarea:hover {
    background:
        oklch(0.99 0.003 258 / 0.72);

    border-color:
        oklch(0.90 0.008 258);
}

textarea:focus {
    background:
        oklch(0.99 0.003 258);

    border-color:
        oklch(0.60 0.19 258);

    box-shadow:
        0 0 0 2px oklch(0.60 0.19 258 / 0.11);
}
</style>
