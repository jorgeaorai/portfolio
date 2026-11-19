export type DisplayType = "pedestal" | "wall" | "showcase"
export type ArtifactStatus = "draft" | "published" | "hidden"

export type MuseumArtifact = {
  id: string
  title: string
  description: string
  author: string
  historical_period: string
  origin: string
  material: string
  real_dimensions: string
  inventory_number: string
  category: string
  model_url: string
  cover_image_url?: string
  audio_url?: string
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  scale_x: number
  scale_y: number
  scale_z: number
  display_type: DisplayType
  shadows_enabled: boolean
  light_intensity: number
  status: ArtifactStatus
  created_at: string
  updated_at: string
  // Optional info computed from 3D model
  triangle_count?: number
  material_count?: number
}
