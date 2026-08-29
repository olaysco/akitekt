import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Architecture } from '../domain/architecture'
import type { DocumentOperation } from '../domain/operation'

import { applyOperation } from '../operations/applyOperation'
import { invertOperation } from '../operations/invertOperation'

type HistoryEntry = {
    operation: DocumentOperation
    inverse: DocumentOperation
}

function createEmptyArchitecture(): Architecture {
    return {
        id: crypto.randomUUID(),
        name: 'Untitled Architecture',
        schemaVersion: 1,

        nodes: [],
        edges: [],
        regions: [],
        annotations: [],

        metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    }
}

export const useArchitectureStore = defineStore(
    'architecture',
    () => {
        const architecture = ref<Architecture>(
            createEmptyArchitecture(),
        )

        const undoStack = ref<HistoryEntry[]>([])
        const redoStack = ref<HistoryEntry[]>([])

        const canUndo = computed(
            () => undoStack.value.length > 0,
        )

        const canRedo = computed(
            () => redoStack.value.length > 0,
        )

        function execute(
            operation: DocumentOperation,
        ): void {
            const architectureBefore =
                architecture.value

            const inverse = invertOperation(
                architectureBefore,
                operation,
            )

            const nextArchitecture = applyOperation(
                architectureBefore,
                operation,
            )

            architecture.value = {
                ...nextArchitecture,

                metadata: {
                    ...nextArchitecture.metadata,
                    updatedAt: new Date().toISOString(),
                },
            }

            undoStack.value.push({
                operation,
                inverse,
            })

            redoStack.value = []
        }

        function undo(): void {
            const entry = undoStack.value.pop()

            if (!entry) {
                return
            }

            architecture.value = applyOperation(
                architecture.value,
                entry.inverse,
            )

            redoStack.value.push(entry)
        }

        function redo(): void {
            const entry = redoStack.value.pop()

            if (!entry) {
                return
            }

            architecture.value = applyOperation(
                architecture.value,
                entry.operation,
            )

            undoStack.value.push(entry)
        }

        function replaceArchitecture(
            nextArchitecture: Architecture,
        ): void {
            architecture.value = nextArchitecture

            undoStack.value = []
            redoStack.value = []
        }

        function resetArchitecture(): void {
            architecture.value =
                createEmptyArchitecture()

            undoStack.value = []
            redoStack.value = []
        }

        return {
            architecture,

            canUndo,
            canRedo,

            execute,
            undo,
            redo,

            replaceArchitecture,
            resetArchitecture,
        }
    },
)
