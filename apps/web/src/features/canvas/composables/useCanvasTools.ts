import { ref, type Ref } from 'vue'
import type { Position } from '../../architectures/domain/node'
import type { AddComponentPayload } from '../components/CanvasToolRail.vue'
import { useArchitectureStore } from '../../architectures/stores/architecture.store'

type Options = {
    screenToFlowCoordinate: (position: { x: number; y: number }) => Position
    regionToolActive: Ref<boolean>
    editingAnnotationId: Ref<string | null>
    clearSelection: () => void
    deactivateAnnotation: () => void
    deactivateRegion: () => void
}

const typeNames: Record<AddComponentPayload['type'], string> = {
    client: 'Client',
    service: 'Service',
    worker: 'Worker',
    database: 'Database',
    cache: 'Cache',
    queue: 'Queue',
    stream: 'Stream',
    'load-balancer': 'Load Balancer',
    gateway: 'Gateway',
    external: 'External System',
    storage: 'Storage',
    scheduler: 'Scheduler',
    custom: 'Component',
}

const technologyNames: Record<string, string> = {
    PostgreSQL: 'PostgreSQL',
    MySQL: 'MySQL',
    MongoDB: 'MongoDB',
    DynamoDB: 'DynamoDB',
    Cassandra: 'Cassandra',
    RabbitMQ: 'RabbitMQ',
    Kafka: 'Kafka',
    SQS: 'SQS',
    'Pub / Sub': 'Pub / Sub',
    NATS: 'NATS',
    Redis: 'Redis',
    Memcached: 'Memcached',
    Browser: 'Client',
    'Mobile app': 'Mobile App',
    CLI: 'CLI',
    'Third-party API': 'External API',
    SaaS: 'External SaaS',
    Partner: 'Partner System',
    Kong: 'Kong',
    Envoy: 'Envoy',
    Nginx: 'Nginx',
    ALB: 'Load Balancer',
    HAProxy: 'HAProxy',
}

export function useCanvasTools(options: Options) {
    const architectureStore = useArchitectureStore()

    const pendingComponent = ref<AddComponentPayload | null>(null)
    const placementPosition = ref<Position | null>(null)
    const annotationToolActive = ref(false)

    function getComponentName(payload: AddComponentPayload) {
        return (payload.technology && technologyNames[payload.technology]) || typeNames[payload.type]
    }

    function selectComponent(payload: AddComponentPayload) {
        pendingComponent.value = payload
        placementPosition.value = null
        annotationToolActive.value = false
        options.regionToolActive.value = false

        options.deactivateAnnotation()
        options.deactivateRegion()
        options.clearSelection()
    }

    function createComponent(payload: AddComponentPayload, position: Position) {
        architectureStore.execute({
            type: 'ADD_NODE',
            node: {
                id: crypto.randomUUID(),
                type: payload.type,
                name: getComponentName(payload),
                position,
                metadata: {
                    technology: payload.technology,
                },
                behavior: {},
            },
        })
    }

    function handleAnnotationTool() {
        annotationToolActive.value = !annotationToolActive.value
        options.regionToolActive.value = false
        pendingComponent.value = null
        placementPosition.value = null

        options.clearSelection()
        options.deactivateRegion()
    }

    function handlePaneClick(event: MouseEvent) {
        if (options.regionToolActive.value) return

        options.clearSelection()

        if (!annotationToolActive.value) return

        const pointerPosition = options.screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })

        const id = crypto.randomUUID()

        architectureStore.execute({
            type: 'ADD_ANNOTATION',
            annotation: {
                id,
                text: 'Annotation',
                kind: 'note',
                position: {
                    x: pointerPosition.x - 102,
                    y: pointerPosition.y - 44,
                },
            },
        })

        options.editingAnnotationId.value = id
        annotationToolActive.value = false
        options.deactivateAnnotation()
    }

    function handleCanvasMouseMove(event: MouseEvent) {
        if (!pendingComponent.value) return

        placementPosition.value = options.screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })
    }

    function handleComponentMouseDown(event: MouseEvent) {
        if (!pendingComponent.value) return

        const pointerPosition = options.screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })

        createComponent(pendingComponent.value, {
            x: pointerPosition.x - 102,
            y: pointerPosition.y - 44,
        })

        pendingComponent.value = null
        placementPosition.value = null
    }

    function cancelTools() {
        pendingComponent.value = null
        placementPosition.value = null
        annotationToolActive.value = false
        options.regionToolActive.value = false

        options.deactivateAnnotation()
        options.deactivateRegion()
    }

    return {
        pendingComponent,
        placementPosition,
        annotationToolActive,
        getComponentName,
        selectComponent,
        handleAnnotationTool,
        handlePaneClick,
        handleCanvasMouseMove,
        handleComponentMouseDown,
        cancelTools,
    }
}
