<script setup lang="ts">
import { computed } from 'vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const props = defineProps<{ regionId: string | null }>()
const architectureStore = useArchitectureStore()

const region = computed(() => architectureStore.architecture.regions.find((item) => item.id === props.regionId))

function updateName(name: string) {
    if (!region.value) return

    architectureStore.execute({
        type: 'UPDATE_REGION',
        regionId: region.value.id,
        changes: { name },
    })
}

function removeRegion() {
    if (!region.value) return

    architectureStore.execute({
        type: 'REMOVE_REGION',
        regionId: region.value.id,
    })
}
</script>

<template>
    <div v-if="region" class="region-inspector">
        <div class="header">
            <div class="header-title">
                <strong>{{ region.name }}</strong>
                <span class="eyebrow">Region</span>
            </div>

            <button class="danger" @click="removeRegion">Delete</button>
        </div>

        <div class="fields">
            <label class="field">
                <span>Name</span>
                <input :value="region.name" @change="updateName(($event.target as HTMLInputElement).value)" />
            </label>

            <div class="field">
                <span>Type</span>
                <div class="readonly-value">{{ region.type ?? 'custom' }}</div>
            </div>

            <div class="field">
                <span>Size</span>
                <div class="readonly-value">{{ Math.round(region.size.width) }} × {{ Math.round(region.size.height) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.region-inspector {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    color: oklch(0.25 0.015 258);
}

.header {
    min-height: 54px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 13px;
    border-bottom: 1px solid oklch(0.93 0.006 258);
}

.header-title {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
}

.header strong {
    overflow: hidden;
    color: oklch(0.22 0.016 258);
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: -0.015em;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.eyebrow {
    color: oklch(0.58 0.014 258);
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 13px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.field>span {
    color: oklch(0.58 0.014 258);
    font-size: 9.5px;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

input {
    width: 100%;
    box-sizing: border-box;
    padding: 7px 9px;
    background: oklch(0.978 0.004 258);
    border: 1px solid oklch(0.90 0.008 258);
    border-radius: 7px;
    color: oklch(0.24 0.015 258);
    font-family: inherit;
    font-size: 12px;
    outline: none;
}

input:focus {
    border-color: oklch(0.60 0.19 258);
}

.readonly-value {
    padding: 2px 0;
    color: oklch(0.34 0.014 258);
    font-size: 12px;
}

.danger {
    flex: none;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid oklch(0.90 0.02 27);
    border-radius: 6px;
    color: oklch(0.58 0.21 27);
    font-family: inherit;
    font-size: 10.5px;
    cursor: pointer;
}
</style>
