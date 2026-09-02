export type AICommandValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }

export function validateAIArchitectureCommand(
  command: unknown,
  architecture?: Architecture,
): AICommandValidationResult {
  const errors: string[] = []

  if (!isRecord(command)) {
    return { valid: false, errors: ['Command must be an object.'] }
  }

  if (!isNonEmptyString(command.id)) errors.push('Command id is required.')
  if (!isNonEmptyString(command.message)) errors.push('Command message is required.')
  if (!Array.isArray(command.operations) || command.operations.length === 0) {
    errors.push('At least one operation is required.')
  } else {
    command.operations.forEach((operation, index) => {
      validateOperation(operation, `Operation ${index + 1}`, errors)
    })
  }

  if (errors.length === 0 && architecture) {
    const state = createReferenceState(architecture)

    ;(command.operations as DocumentOperation[]).forEach((operation, index) => {
      validateOperationReferences(operation, `Operation ${index + 1}`, state, errors)
    })
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors }
}

type ReferenceState = {
  nodeIds: Set<string>
  edgeIds: Set<string>
  regionIds: Set<string>
  annotationIds: Set<string>
  edgeNodes: Map<string, { sourceId: string; targetId: string }>
}

function createReferenceState(architecture: Architecture): ReferenceState {
  return {
    nodeIds: new Set(architecture.nodes.map((node) => node.id)),
    edgeIds: new Set(architecture.edges.map((edge) => edge.id)),
    regionIds: new Set(architecture.regions.map((region) => region.id)),
    annotationIds: new Set(architecture.annotations.map((annotation) => annotation.id)),
    edgeNodes: new Map(architecture.edges.map((edge) => [
      edge.id,
      { sourceId: edge.source.nodeId, targetId: edge.target.nodeId },
    ])),
  }
}

function validateOperationReferences(
  operation: DocumentOperation,
  label: string,
  state: ReferenceState,
  errors: string[],
) {
  switch (operation.type) {
    case 'ADD_NODE':
      if (state.nodeIds.has(operation.node.id)) {
        errors.push(`${label} adds a node with an existing id.`)
      }
      if (operation.node.regionId && !state.regionIds.has(operation.node.regionId)) {
        errors.push(`${label} references a missing region.`)
      }
      state.nodeIds.add(operation.node.id)
      return
    case 'UPDATE_NODE':
      validateKnownId(state.nodeIds, operation.nodeId, 'node', label, errors)
      if (operation.changes.regionId && !state.regionIds.has(operation.changes.regionId)) {
        errors.push(`${label} references a missing region.`)
      }
      return
    case 'REMOVE_NODE':
      validateKnownId(state.nodeIds, operation.nodeId, 'node', label, errors)
      state.nodeIds.delete(operation.nodeId)
      for (const [edgeId, edge] of state.edgeNodes) {
        if (edge.sourceId === operation.nodeId || edge.targetId === operation.nodeId) {
          state.edgeIds.delete(edgeId)
          state.edgeNodes.delete(edgeId)
        }
      }
      return
    case 'ADD_EDGE':
      if (state.edgeIds.has(operation.edge.id)) {
        errors.push(`${label} adds an edge with an existing id.`)
      }
      validateKnownId(state.nodeIds, operation.edge.source.nodeId, 'source node', label, errors)
      validateKnownId(state.nodeIds, operation.edge.target.nodeId, 'target node', label, errors)
      state.edgeIds.add(operation.edge.id)
      state.edgeNodes.set(operation.edge.id, {
        sourceId: operation.edge.source.nodeId,
        targetId: operation.edge.target.nodeId,
      })
      return
    case 'UPDATE_EDGE':
    case 'REMOVE_EDGE':
      validateKnownId(state.edgeIds, operation.edgeId, 'edge', label, errors)
      if (operation.type === 'REMOVE_EDGE') {
        state.edgeIds.delete(operation.edgeId)
        state.edgeNodes.delete(operation.edgeId)
      }
      return
    case 'ADD_REGION':
      if (state.regionIds.has(operation.region.id)) {
        errors.push(`${label} adds a region with an existing id.`)
      }
      if (operation.region.parentRegionId && !state.regionIds.has(operation.region.parentRegionId)) {
        errors.push(`${label} references a missing parent region.`)
      }
      state.regionIds.add(operation.region.id)
      return
    case 'UPDATE_REGION':
    case 'REMOVE_REGION':
      validateKnownId(state.regionIds, operation.regionId, 'region', label, errors)
      if (operation.type === 'REMOVE_REGION') state.regionIds.delete(operation.regionId)
      return
    case 'ADD_ANNOTATION':
      if (state.annotationIds.has(operation.annotation.id)) {
        errors.push(`${label} adds an annotation with an existing id.`)
      }
      state.annotationIds.add(operation.annotation.id)
      return
    case 'UPDATE_ANNOTATION':
    case 'REMOVE_ANNOTATION':
      validateKnownId(state.annotationIds, operation.annotationId, 'annotation', label, errors)
      if (operation.type === 'REMOVE_ANNOTATION') state.annotationIds.delete(operation.annotationId)
      return
    case 'MOVE_NODE':
    case 'RESIZE_NODE':
      validateKnownId(state.nodeIds, operation.nodeId, 'node', label, errors)
      return
    case 'MOVE_REGION':
    case 'RESIZE_REGION':
      validateKnownId(state.regionIds, operation.regionId, 'region', label, errors)
      return
    case 'COMPOSITE':
      operation.operations.forEach((child, index) => {
        validateOperationReferences(child, `${label}.${index + 1}`, state, errors)
      })
  }
}

function validateKnownId(
  ids: Set<string>,
  id: string,
  name: string,
  label: string,
  errors: string[],
) {
  if (!ids.has(id)) errors.push(`${label} references a missing ${name}.`)
}

function validateOperation(
  operation: unknown,
  label: string,
  errors: string[],
) {
  if (!isRecord(operation) || !isNonEmptyString(operation.type)) {
    errors.push(`${label} must include a type.`)
    return
  }

  switch (operation.type) {
    case 'ADD_NODE':
      validateNode(operation.node, label, errors)
      return
    case 'UPDATE_NODE':
      validateTargetAndChanges(operation, 'nodeId', label, errors)
      return
    case 'REMOVE_NODE':
      validateIdentifier(operation.nodeId, 'node id', label, errors)
      return
    case 'ADD_EDGE':
      validateEdge(operation.edge, label, errors)
      return
    case 'UPDATE_EDGE':
      validateTargetAndChanges(operation, 'edgeId', label, errors)
      return
    case 'REMOVE_EDGE':
      validateIdentifier(operation.edgeId, 'edge id', label, errors)
      return
    case 'ADD_REGION':
      validateRegion(operation.region, label, errors)
      return
    case 'UPDATE_REGION':
      validateTargetAndChanges(operation, 'regionId', label, errors)
      return
    case 'REMOVE_REGION':
      validateIdentifier(operation.regionId, 'region id', label, errors)
      return
    case 'ADD_ANNOTATION':
      validateAnnotation(operation.annotation, label, errors)
      return
    case 'UPDATE_ANNOTATION':
      validateTargetAndChanges(operation, 'annotationId', label, errors)
      return
    case 'REMOVE_ANNOTATION':
      validateIdentifier(operation.annotationId, 'annotation id', label, errors)
      return
    case 'MOVE_NODE':
      validateIdentifier(operation.nodeId, 'node id', label, errors)
      validatePosition(operation.position, label, errors)
      return
    case 'RESIZE_NODE':
      validateIdentifier(operation.nodeId, 'node id', label, errors)
      validateSize(operation.size, label, errors)
      return
    case 'MOVE_REGION':
      validateIdentifier(operation.regionId, 'region id', label, errors)
      validatePosition(operation.position, label, errors)
      return
    case 'RESIZE_REGION':
      validateIdentifier(operation.regionId, 'region id', label, errors)
      validateSize(operation.size, label, errors)
      return
    case 'COMPOSITE':
      if (!Array.isArray(operation.operations) || operation.operations.length === 0) {
        errors.push(`${label} must include at least one child operation.`)
        return
      }

      operation.operations.forEach((childOperation, index) => {
        validateOperation(childOperation, `${label}.${index + 1}`, errors)
      })
      return
    default:
      errors.push(`${label} has an unsupported type: ${operation.type}.`)
  }
}

function validateNode(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${label} must include a node.`)
    return
  }

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.type) || !isNonEmptyString(value.name)) {
    errors.push(`${label} node must include an id, type, and name.`)
  }

  validatePosition(value.position, `${label} node`, errors)

  if (!isRecord(value.metadata) || !isRecord(value.behavior)) {
    errors.push(`${label} node must include metadata and behavior objects.`)
  }
}

function validateEdge(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${label} must include an edge.`)
    return
  }

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.type)) {
    errors.push(`${label} edge must include an id and type.`)
  }

  validateEndpoint(value.source, `${label} source`, errors)
  validateEndpoint(value.target, `${label} target`, errors)

  if (!isRecord(value.behavior)) {
    errors.push(`${label} edge must include a behavior object.`)
  }
}

function validateRegion(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${label} must include a region.`)
    return
  }

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name)) {
    errors.push(`${label} region must include an id and name.`)
  }

  validatePosition(value.position, `${label} region`, errors)
  validateSize(value.size, `${label} region`, errors)
}

function validateAnnotation(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${label} must include an annotation.`)
    return
  }

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.text)) {
    errors.push(`${label} annotation must include an id and text.`)
  }

  validatePosition(value.position, `${label} annotation`, errors)
}

function validateTargetAndChanges(
  operation: Record<string, unknown>,
  targetKey: string,
  label: string,
  errors: string[],
) {
  validateIdentifier(operation[targetKey], targetKey.replace('Id', ' id'), label, errors)

  if (!isRecord(operation.changes)) {
    errors.push(`${label} must include a changes object.`)
  }
}

function validateEndpoint(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value) || !isNonEmptyString(value.nodeId)) {
    errors.push(`${label} must include a node id.`)
  }
}

function validateIdentifier(value: unknown, name: string, label: string, errors: string[]) {
  if (!isNonEmptyString(value)) {
    errors.push(`${label} must include a ${name}.`)
  }
}

function validatePosition(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value) || !isFiniteNumber(value.x) || !isFiniteNumber(value.y)) {
    errors.push(`${label} must include a valid position.`)
  }
}

function validateSize(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value) || !isPositiveNumber(value.width) || !isPositiveNumber(value.height)) {
    errors.push(`${label} must include a valid size.`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}
import type { Architecture } from '../../architectures/domain/architecture'
import type { DocumentOperation } from '../../architectures/domain/operation'
