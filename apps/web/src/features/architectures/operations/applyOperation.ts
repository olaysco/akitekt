import type { Architecture } from '../domain/architecture'
import type { DocumentOperation } from '../domain/operation'

export function applyOperation(
    architecture: Architecture,
    operation: DocumentOperation,
): Architecture {
    switch (operation.type) {
        case 'COMPOSITE':
            return operation.operations.reduce(
                (currentArchitecture, childOperation) =>
                    applyOperation(currentArchitecture, childOperation),
                architecture,
            )
        case 'ADD_NODE':
            return {
                ...architecture,
                nodes: [...architecture.nodes, operation.node],
            }

        case 'UPDATE_NODE':
            return {
                ...architecture,
                nodes: architecture.nodes.map((node) =>
                    node.id === operation.nodeId
                        ? {
                            ...node,
                            ...operation.changes,
                        }
                        : node,
                ),
            }

        case 'REMOVE_NODE':
            return {
                ...architecture,

                nodes: architecture.nodes.filter(
                    (node) => node.id !== operation.nodeId,
                ),

                edges: architecture.edges.filter(
                    (edge) =>
                        edge.source.nodeId !== operation.nodeId &&
                        edge.target.nodeId !== operation.nodeId,
                ),
            }

        case 'ADD_EDGE':
            return {
                ...architecture,
                edges: [...architecture.edges, operation.edge],
            }

        case 'UPDATE_EDGE':
            return {
                ...architecture,
                edges: architecture.edges.map((edge) =>
                    edge.id === operation.edgeId
                        ? {
                            ...edge,
                            ...operation.changes,
                        }
                        : edge,
                ),
            }

        case 'REMOVE_EDGE':
            return {
                ...architecture,
                edges: architecture.edges.filter(
                    (edge) => edge.id !== operation.edgeId,
                ),
            }

        case 'ADD_REGION':
            return {
                ...architecture,
                regions: [...architecture.regions, operation.region],
            }

        case 'UPDATE_REGION':
            return {
                ...architecture,
                regions: architecture.regions.map((region) =>
                    region.id === operation.regionId
                        ? {
                            ...region,
                            ...operation.changes,
                        }
                        : region,
                ),
            }

        case 'REMOVE_REGION':
            return {
                ...architecture,

                regions: architecture.regions.filter(
                    (region) => region.id !== operation.regionId,
                ),

                nodes: architecture.nodes.map((node) =>
                    node.regionId === operation.regionId
                        ? {
                            ...node,
                            regionId: undefined,
                        }
                        : node,
                ),
            }

        case 'ADD_ANNOTATION':
            return {
                ...architecture,
                annotations: [
                    ...architecture.annotations,
                    operation.annotation,
                ],
            }

        case 'UPDATE_ANNOTATION':
            return {
                ...architecture,
                annotations: architecture.annotations.map((annotation) =>
                    annotation.id === operation.annotationId
                        ? {
                            ...annotation,
                            ...operation.changes,
                        }
                        : annotation,
                ),
            }

        case 'REMOVE_ANNOTATION':
            return {
                ...architecture,
                annotations: architecture.annotations.filter(
                    (annotation) => annotation.id !== operation.annotationId,
                ),
            }

        case 'MOVE_NODE':
            return {
                ...architecture,
                nodes: architecture.nodes.map((node) =>
                    node.id === operation.nodeId
                        ? {
                            ...node,
                            position: operation.position,
                        }
                        : node,
                ),
            }

        case 'RESIZE_NODE':
            return {
                ...architecture,
                nodes: architecture.nodes.map((node) =>
                    node.id === operation.nodeId
                        ? {
                            ...node,
                            size: operation.size,
                        }
                        : node,
                ),
            }

        case 'MOVE_REGION':
            return {
                ...architecture,
                regions: architecture.regions.map((region) =>
                    region.id === operation.regionId
                        ? {
                            ...region,
                            position: operation.position,
                        }
                        : region,
                ),
            }

        case 'RESIZE_REGION':
            return {
                ...architecture,
                regions: architecture.regions.map((region) =>
                    region.id === operation.regionId
                        ? {
                            ...region,
                            size: operation.size,
                        }
                        : region,
                ),
            }

        default: {
            const exhaustiveCheck: never = operation
            return exhaustiveCheck
        }
    }
}
