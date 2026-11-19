import { GALLERY_PROJECTS } from "@/components/metaverse/gallery-data"

export type MediaType = "video" | "image"

export interface MediaFrameItem {
  id: string
  title: string
  mediaType: MediaType
  url: string
  width?: number
  height?: number
  totemEnabled?: boolean
  totemLabel?: string
  totemHtml?: string
  totemHtmlUrl?: string
}

export interface GalleryRoomConfig {
  id: string
  title: string
  subtitle?: string
  backWall: {
    mediaType: MediaType
    url: string
  }
  leftFrames: MediaFrameItem[]
  rightFrames: MediaFrameItem[]
}

export interface PlazaWallFrameItem {
  id: string
  side: "left" | "right"
  title: string
  mediaType: MediaType
  url: string
  zOffset: number
}

export interface StageMediaConfig {
  title: string
  subtitle: string
  showTextOverlay: boolean
  mediaType: MediaType
  url: string
}

export interface MetaverseCMSData {
  stage: StageMediaConfig
  galleries: GalleryRoomConfig[]
  plazaFrames: PlazaWallFrameItem[]
  updatedAt: string
}

export function createDefaultMetaverseCMSData(): MetaverseCMSData {
  const galleries: GalleryRoomConfig[] = GALLERY_PROJECTS.map((title, idx) => ({
    id: `gallery-${idx + 1}`,
    title,
    subtitle: "GALERIA DE PROJETO",
    backWall: {
      mediaType: "video",
      url: "",
    },
    leftFrames: [1, 2, 3].map((n) => ({
      id: `g-${idx + 1}-left-${n}`,
      title: `Quadro Esquerdo ${n}`,
      mediaType: "image",
      url: "",
    })),
    rightFrames: [1, 2, 3].map((n) => ({
      id: `g-${idx + 1}-right-${n}`,
      title: `Quadro Direito ${n}`,
      mediaType: "image",
      url: "",
    })),
  }))

  const plazaZPositions = [-20, -10, 0, 10, 20]
  const plazaFrames: PlazaWallFrameItem[] = [
    ...plazaZPositions.map((z, i) => ({
      id: `plaza-left-${i + 1}`,
      side: "left" as const,
      title: `Painel Praça Esquerda ${i + 1}`,
      mediaType: "image" as MediaType,
      url: "",
      zOffset: z,
    })),
    ...plazaZPositions.map((z, i) => ({
      id: `plaza-right-${i + 1}`,
      side: "right" as const,
      title: `Painel Praça Direita ${i + 1}`,
      mediaType: "image" as MediaType,
      url: "",
      zOffset: z,
    })),
  ]

  return {
    stage: {
      title: "JORGE AOR",
      subtitle: "PORTFÓLIO",
      showTextOverlay: true,
      mediaType: "video",
      url: "",
    },
    galleries,
    plazaFrames,
    updatedAt: new Date().toISOString(),
  }
}
