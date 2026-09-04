import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Architecture } from '../domain/architecture'
import type { DocumentOperation } from '../domain/operation'

import { applyOperation } from '../operations/applyOperation'
import { invertOperation } from '../operations/invertOperation'
import { loadArchitectures, saveArchitectures } from '../services/architecturePersistence'

type HistoryEntry = {
    operation: DocumentOperation
    inverse: DocumentOperation
}

type ArchitectureDocument = {
    id: string
    architecture: Architecture
    undoStack: HistoryEntry[]
    redoStack: HistoryEntry[]
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

function createDocument(
    architecture: Architecture,
): ArchitectureDocument {
    return {
        id: architecture.id,
        architecture,
        undoStack: [],
        redoStack: [],
    }
}

const savedArchitectures = loadArchitectures()

export const useArchitectureStore = defineStore(
    'architecture',
    () => {
        const documents = ref<ArchitectureDocument[]>(
            savedArchitectures.length > 0
                ? savedArchitectures.map(createDocument)
                : [createDocument(createEmptyArchitecture())],
        )

        const activeDocumentId = ref<string>(
            documents.value[0].id,
        )

        const activeDocument = computed(
            () =>
                documents.value.find(
                    (document) => document.id === activeDocumentId.value,
                ) ?? documents.value[0],
        )

        const architecture = computed(
            () => activeDocument.value.architecture,
        )

        const tabs = computed(() =>
            documents.value.map((document) => ({
                id: document.id,
                name: document.architecture.name,
            })),
        )

        const canUndo = computed(
            () => activeDocument.value.undoStack.length > 0,
        )

        const canRedo = computed(
            () => activeDocument.value.redoStack.length > 0,
        )

        function persist(): void {
            saveArchitectures(
                documents.value.map(
                    (document) => document.architecture,
                ),
            )
        }

        function execute( operation: DocumentOperation ): void {
            const document = activeDocument.value

            const inverse = invertOperation(
                document.architecture,
                operation,
            )

            const nextArchitecture = applyOperation(
                document.architecture,
                operation,
            )

            document.architecture = { ...nextArchitecture,
                metadata: {
                    ...nextArchitecture.metadata,
                    updatedAt: new Date().toISOString(),
                },
            }

            document.undoStack.push({
                operation,
                inverse,
            })

            document.redoStack = []

            persist()
        }

        function undo(): void {
            const document = activeDocument.value
            const entry = document.undoStack.pop()

            if (!entry) {
                return
            }

            document.architecture = applyOperation(
                document.architecture,
                entry.inverse,
            )

            document.redoStack.push(entry)
            persist()
        }

        function redo(): void {
            const document = activeDocument.value
            const entry = document.redoStack.pop()

            if (!entry) {
                return
            }

            document.architecture = applyOperation(
                document.architecture,
                entry.operation,
            )

            document.undoStack.push(entry)
            persist()
        }

        function openDocument(
            nextArchitecture: Architecture,
        ): void {
            documents.value.push(
                createDocument(nextArchitecture),
            )

            activateDocument(nextArchitecture.id)
            persist()
        }

        function openBlankDocument(): void {
            openDocument(createEmptyArchitecture())
        }

        function renameDocument(id: string, name: string): void {
            const document = documents.value.find(
                (item) => item.id === id,
            )

            const trimmed = name.trim()

            if (!document || !trimmed) {
                return
            }

            document.architecture = {
                ...document.architecture,
                name: trimmed,
                metadata: {
                    ...document.architecture.metadata,
                    updatedAt: new Date().toISOString(),
                },
            }

            persist()
        }

        function activateDocument(id: string): void {
            activeDocumentId.value = id
        }

        function closeDocument(id: string): void {
            const index = documents.value.findIndex(
                (document) => document.id === id,
            )

            if (index < 0) {
                return
            }

            documents.value.splice(index, 1)

            if (documents.value.length === 0) {
                documents.value.push(
                    createDocument(createEmptyArchitecture()),
                )
            }

            if (activeDocumentId.value === id) {
                const next = documents.value[
                    Math.min(index, documents.value.length - 1)
                ]

                activateDocument(next.id)
            }

            persist()
        }

        function replaceArchitecture(
            nextArchitecture: Architecture,
        ): void {
            const document = activeDocument.value

            document.architecture = nextArchitecture
            document.undoStack = []
            document.redoStack = []

            persist()
        }

        function resetArchitecture(): void {
            replaceArchitecture(createEmptyArchitecture())
        }

        return {
            architecture,

            tabs,
            activeDocumentId,

            canUndo,
            canRedo,

            execute,
            undo,
            redo,

            openDocument,
            openBlankDocument,
            renameDocument,
            activateDocument,
            closeDocument,

            replaceArchitecture,
            resetArchitecture,
        }
    },
)
