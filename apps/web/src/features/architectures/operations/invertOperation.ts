import { applyOperation } from './applyOperation'
import type { Architecture } from '../domain/architecture'
import type { DocumentOperation } from '../domain/operation'

export function invertOperation(
    architectureBefore: Architecture,
    operation: DocumentOperation,
): DocumentOperation {
    switch (operation.type) {
        case 'ADD_NODE':
            return {
                type: 'REMOVE_NODE',
                nodeId: operation.node.id,
            }

        case 'UPDATE_NODE': {
            const node = architectureBefore.nodes.find(
                (item) => item.id === operation.nodeId,
            )

            if (!node) {
                throw new Error(`Cannot invert UPDATE_NODE: node ${operation.nodeId} not found`)
            }

            const previousChanges = Object.fromEntries(
                Object.keys(operation.changes).map((key) => [
                    key,
                    node[key as keyof typeof node],
                ]),
            )

            return {
                type: 'UPDATE_NODE',
                nodeId: operation.nodeId,
                changes: previousChanges,
            }
        }

        case 'REMOVE_NODE': {
            const node = architectureBefore.nodes.find(
                (item) => item.id === operation.nodeId,
            )

            if (!node) {
                throw new Error(
                    `Cannot invert REMOVE_NODE: node ${operation.nodeId} not found`,
                )
            }

            const connectedEdges = architectureBefore.edges.filter(
                (edge) =>
                    edge.source.nodeId === operation.nodeId ||
                    edge.target.nodeId === operation.nodeId,
            )

            return {
                type: 'COMPOSITE',
                operations: [
                    {
                        type: 'ADD_NODE',
                        node,
                    },

                    ...connectedEdges.map(
                        (edge): DocumentOperation => ({
                            type: 'ADD_EDGE',
                            edge,
                        }),
                    ),
                ],
            }
        }

        case 'ADD_EDGE':
            return {
                type: 'REMOVE_EDGE',
                edgeId: operation.edge.id,
            }

        case 'UPDATE_EDGE': {
            const edge = architectureBefore.edges.find(
                (item) => item.id === operation.edgeId,
            )

            if (!edge) {
                throw new Error(`Cannot invert UPDATE_EDGE: edge ${operation.edgeId} not found`)
            }

            const previousChanges = Object.fromEntries(
                Object.keys(operation.changes).map((key) => [
                    key,
                    edge[key as keyof typeof edge],
                ]),
            )

            return {
                type: 'UPDATE_EDGE',
                edgeId: operation.edgeId,
                changes: previousChanges,
            }
        }

        case 'REMOVE_EDGE': {
            const edge = architectureBefore.edges.find(
                (item) => item.id === operation.edgeId,
            )

            if (!edge) {
                throw new Error(`Cannot invert REMOVE_EDGE: edge ${operation.edgeId} not found`)
            }

            return {
                type: 'ADD_EDGE',
                edge,
            }
        }

        case 'ADD_REGION':
            return {
                type: 'REMOVE_REGION',
                regionId: operation.region.id,
            }

        case 'UPDATE_REGION': {
            const region = architectureBefore.regions.find(
                (item) => item.id === operation.regionId,
            )

            if (!region) {
                throw new Error(`Cannot invert UPDATE_REGION: region ${operation.regionId} not found`)
            }

            const previousChanges = Object.fromEntries(
                Object.keys(operation.changes).map((key) => [
                    key,
                    region[key as keyof typeof region],
                ]),
            )

            return {
                type: 'UPDATE_REGION',
                regionId: operation.regionId,
                changes: previousChanges,
            }
        }

        case 'REMOVE_REGION': {
            const region = architectureBefore.regions.find(
                (item) => item.id === operation.regionId,
            )

            if (!region) {
                throw new Error(
                    `Cannot invert REMOVE_REGION: region ${operation.regionId} not found`,
                )
            }

            const affectedNodes = architectureBefore.nodes.filter(
                (node) => node.regionId === operation.regionId,
            )

            return {
                type: 'COMPOSITE',
                operations: [
                    {
                        type: 'ADD_REGION',
                        region,
                    },

                    ...affectedNodes.map(
                        (node): DocumentOperation => ({
                            type: 'UPDATE_NODE',
                            nodeId: node.id,
                            changes: {
                                regionId: operation.regionId,
                            },
                        }),
                    ),
                ],
            }
        }

        case 'ADD_ANNOTATION':
            return {
                type: 'REMOVE_ANNOTATION',
                annotationId: operation.annotation.id,
            }

        case 'UPDATE_ANNOTATION': {
            const annotation = architectureBefore.annotations.find(
                (item) => item.id === operation.annotationId,
            )

            if (!annotation) {
                throw new Error(
                    `Cannot invert UPDATE_ANNOTATION: annotation ${operation.annotationId} not found`,
                )
            }

            const previousChanges = Object.fromEntries(
                Object.keys(operation.changes).map((key) => [
                    key,
                    annotation[key as keyof typeof annotation],
                ]),
            )

            return {
                type: 'UPDATE_ANNOTATION',
                annotationId: operation.annotationId,
                changes: previousChanges,
            }
        }

        case 'REMOVE_ANNOTATION': {
            const annotation = architectureBefore.annotations.find(
                (item) => item.id === operation.annotationId,
            )

            if (!annotation) {
                throw new Error(
                    `Cannot invert REMOVE_ANNOTATION: annotation ${operation.annotationId} not found`,
                )
            }

            return {
                type: 'ADD_ANNOTATION',
                annotation,
            }
        }

        case 'MOVE_NODE': {
            const node = architectureBefore.nodes.find(
                (item) => item.id === operation.nodeId,
            )

            if (!node) {
                throw new Error(`Cannot invert MOVE_NODE: node ${operation.nodeId} not found`)
            }

            return {
                type: 'MOVE_NODE',
                nodeId: operation.nodeId,
                position: node.position,
            }
        }

        case 'RESIZE_NODE': {
            const node = architectureBefore.nodes.find(
                (item) => item.id === operation.nodeId,
            )

            if (!node || !node.size) {
                throw new Error(`Cannot invert RESIZE_NODE: node ${operation.nodeId} has no previous size`)
            }

            return {
                type: 'RESIZE_NODE',
                nodeId: operation.nodeId,
                size: node.size,
            }
        }

        case 'MOVE_REGION': {
            const region = architectureBefore.regions.find(
                (item) => item.id === operation.regionId,
            )

            if (!region) {
                throw new Error(`Cannot invert MOVE_REGION: region ${operation.regionId} not found`)
            }

            return {
                type: 'MOVE_REGION',
                regionId: operation.regionId,
                position: region.position,
            }
        }

        case 'RESIZE_REGION': {
            const region = architectureBefore.regions.find(
                (item) => item.id === operation.regionId,
            )

            if (!region) {
                throw new Error(`Cannot invert RESIZE_REGION: region ${operation.regionId} not found`)
            }

            return {
                type: 'RESIZE_REGION',
                regionId: operation.regionId,
                size: region.size,
            }
        }

        case 'COMPOSITE': {
            const inverses: DocumentOperation[] = []

            let currentArchitecture = architectureBefore

            for (const childOperation of operation.operations) {
                const inverse = invertOperation(
                    currentArchitecture,
                    childOperation,
                )

                inverses.unshift(inverse)

                currentArchitecture = applyOperation(
                    currentArchitecture,
                    childOperation,
                )
            }

            return {
                type: 'COMPOSITE',
                operations: inverses,
            }
        }

        default: {
            const exhaustiveCheck: never = operation
            return exhaustiveCheck
        }
    }
}
