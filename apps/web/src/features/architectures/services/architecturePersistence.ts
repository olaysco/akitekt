import type { Architecture } from '../domain/architecture'

const STORAGE_KEY = 'akitekt:documents'

const LEGACY_STORAGE_KEY = 'akitekt:architecture'

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

function parseStored(key: string): unknown {
    const stored = localStorage.getItem(key)

    if (!stored) {
        return null
    }

    try {
        return JSON.parse(stored)
    } catch {
        return null
    }
}

export function saveArchitectures(
    architectures: Architecture[],
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(architectures),
    )
}

export function loadArchitectures(): Architecture[] {
    const parsed = parseStored(STORAGE_KEY)

    if (Array.isArray(parsed)) {
        return parsed.filter(isCompatibleArchitecture)
    }

    const legacy = parseStored(LEGACY_STORAGE_KEY)

    return isCompatibleArchitecture(legacy) ? [legacy] : []
}
