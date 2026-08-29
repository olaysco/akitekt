import type { Position, Size } from './node'

export type RegionType =
  | 'system'
  | 'service-boundary'
  | 'network'
  | 'cloud'
  | 'availability-zone'
  | 'region'
  | 'team'
  | 'custom'

export type ArchitectureRegion = {
  id: string
  name: string

  type?: RegionType

  position: Position
  size: Size

  parentRegionId?: string
}
