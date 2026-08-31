<script setup lang="ts">
import { computed } from 'vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

const props = defineProps<{
    regionId: string | null
}>()

const architectureStore = useArchitectureStore()

const region = computed(() =>
    architectureStore.architecture.regions.find(
        (item) => item.id === props.regionId,
    ),
)

function updateName(name: string) {
    if (!region.value) return

    architectureStore.execute({
        type: 'UPDATE_REGION',

        regionId: region.value.id,

        changes: {
            name,
        },
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
    <aside v-if="region" class="region-inspector">
        <div class="inspector-heading">
            Region
        </div>

        <label>
            <span>Name</span>

            <input :value="region.name" @change="
                updateName(
                    ($event.target as HTMLInputElement).value,
                )
                " />
        </label>

        <label>
            <span>Type</span>

            <div class="readonly-value">
                {{ region.type ?? 'custom' }}
            </div>
        </label>

        <div class="region-size">
            {{ Math.round(region.size.width) }}
            ×
            {{ Math.round(region.size.height) }}
        </div>

        <button class="delete-button" @click="removeRegion">
            Delete region
        </button>
    </aside>
</template>

<style scoped>
.region-inspector {
    position: absolute;
    top: 18px;
    right: 18px;

    width: 250px;

    padding: 15px;

    z-index: 20;

    background: oklch(0.995 0.002 258);

    border: 1px solid oklch(0.875 0.009 258);

    /* border-radius: 9px;

    box-shadow: 0 8px 24px oklch(0.35 0.02 258 / 0.09); */

    font-family: "IBM Plex Sans", system-ui, sans-serif;
}

.inspector-heading {
    margin-bottom: 14px;

    color: oklch(0.34 0.014 258);

    font-size: 12px;
    font-weight: 600;
}

label {
    display: block;

    margin-bottom: 12px;
}

label>span {
    display: block;

    margin-bottom: 5px;

    color: oklch(0.58 0.014 258);

    font-size: 9px;
    font-weight: 500;

    letter-spacing: 0.07em;

    text-transform: uppercase;
}

input {
    width: 100%;
    padding: 7px 8px;
    border: 1px solid oklch(0.875 0.009 258);
    border-radius: 6px;
    background: white;
    color: oklch(0.30 0.014 258);
    font: inherit;
    font-size: 11px;
    outline: none;
}

input:focus {
    border-color: oklch(0.60 0.19 258);
    box-shadow: 0 0 0 2px oklch(0.60 0.19 258 / 0.10);
}

.readonly-value,
.region-size {
    color: oklch(0.42 0.014 258);
    font-size: 11px;
}

.region-size {
    margin: 2px 0 16px;

    color: oklch(0.62 0.012 258);
}

.delete-button {
    width: 100%;
    padding: 8px;
    border: 1px solid oklch(0.82 0.08 27);
    border-radius: 6px;
    background: transparent;
    color: oklch(0.52 0.18 27);
    font-family: inherit;
    font-size: 10.5px;
    cursor: pointer;
}
</style>
