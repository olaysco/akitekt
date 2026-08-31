import type { Architecture } from '../domain/architecture'

const STORAGE_KEY = 'akitekt:architecture'

const CURRENT_SCHEMA_VERSION = 1

function isCompatibleArchitecture(
    value: unknown,
): value is Architecture {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const architecture = value as Partial<Architecture>

    return (
        architecture.schemaVersion ===
        CURRENT_SCHEMA_VERSION &&
        typeof architecture.id === 'string' &&
        typeof architecture.name === 'string' &&
        Array.isArray(architecture.nodes) &&
        Array.isArray(architecture.edges) &&
        Array.isArray(architecture.regions) &&
        Array.isArray(architecture.annotations)
    )
}

export function saveArchitecture(
    architecture: Architecture,
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(architecture),
    )
}

export function loadArchitecture(): Architecture | null {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
        return null
    }

    try {
        const parsed: unknown = JSON.parse(stored)

        if (!isCompatibleArchitecture(parsed)) {
            return null
        }

        return parsed
    } catch {
        return null
    }
}

export function clearSavedArchitecture() {
    localStorage.removeItem(STORAGE_KEY)
}