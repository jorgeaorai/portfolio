export interface AvatarConfig {
  nickname: string
  color: string
  secondaryColor: string
  scale?: number
}

export interface ScenarioInfo {
  id: string
  title: string
  subtitle: string
  category: string
  description: string
  tag: string
  badgeColor?: string
  spawnPosition: [number, number, number]
  environmentType: "night" | "sunset" | "cyber"
  features: string[]
}

export interface PlayerTransform {
  x: number
  y: number
  z: number
  rotationY: number
}

export interface BoxCollider {
  type: "box"
  x: number
  z: number
  halfWidth: number
  halfDepth: number
  rotationY?: number
  topY: number
  walkable?: boolean
}

export interface CircleCollider {
  type: "circle"
  x: number
  z: number
  radius: number
  topY: number
  walkable?: boolean
}

export type SceneCollider = BoxCollider | CircleCollider
