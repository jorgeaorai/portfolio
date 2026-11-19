"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Html, Text } from "@react-three/drei"
import * as THREE from "three"
import { getGalleryCenter, getPlazaPortal } from "../gallery-data"
import { SceneCollider } from "../types"
import {
  createDefaultMetaverseCMSData,
  GalleryRoomConfig,
  MediaFrameItem,
  MediaType,
  MetaverseCMSData,
  StageMediaConfig,
} from "@/lib/types/metaverse-cms"

const METAL = "#1c1716"
const CHARCOAL = "#171312"
const GOLD_LED = "#ffb057"
const IVORY = "#f3ebe4"

export function getGalleryRoomLength(room?: GalleryRoomConfig): number {
  if (!room) return 32
  const maxFrames = Math.max(room.leftFrames?.length || 0, room.rightFrames?.length || 0, 3)
  return Math.max(32, maxFrames * 8.2 + 7.4)
}

export function getFrameZPositions(count: number, roomLength: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [0]
  const usableSpan = roomLength - 15.6
  const start = -usableSpan / 2
  const step = usableSpan / (count - 1)
  return Array.from({ length: count }, (_, i) => start + i * step)
}

export function getCyberPlazaBounds(activeGallery: number | null, cmsData?: MetaverseCMSData) {
  if (activeGallery !== null) {
    const [gx, , gz] = getGalleryCenter(activeGallery)
    const room = cmsData?.galleries?.[activeGallery]
    const halfLen = getGalleryRoomLength(room) / 2
    return {
      minX: gx - 9.0,
      maxX: gx + 9.0,
      minZ: gz - (halfLen - 0.9),
      maxZ: gz + (halfLen - 0.8),
    }
  }
  return { minX: -48, maxX: 48, minZ: -48, maxZ: 48 }
}

export function getCyberPlazaColliders(activeGallery: number | null, cmsData?: MetaverseCMSData): SceneCollider[] {
  if (activeGallery !== null) {
    const [gx, , gz] = getGalleryCenter(activeGallery)
    const room = cmsData?.galleries?.[activeGallery]
    const roomLen = getGalleryRoomLength(room)
    const halfLen = roomLen / 2
    const roomWidth = 19.2

    const leftZ = getFrameZPositions(room?.leftFrames?.length || 0, roomLen)
    const rightZ = getFrameZPositions(room?.rightFrames?.length || 0, roomLen)

    const totemColliders: SceneCollider[] = [
      ...leftZ.map((fz) => ({
        type: "circle" as const,
        x: gx - (roomWidth / 2 - 1.25),
        z: gz + fz,
        radius: 0.42,
        topY: 1.35,
        walkable: false,
      })),
      ...rightZ.map((fz) => ({
        type: "circle" as const,
        x: gx + (roomWidth / 2 - 1.25),
        z: gz + fz,
        radius: 0.42,
        topY: 1.35,
        walkable: false,
      })),
    ]

    return [
      // Paredes da galeria
      { type: "box", x: gx - 9.6, z: gz, halfWidth: 0.3, halfDepth: halfLen, topY: 11, walkable: false },
      { type: "box", x: gx + 9.6, z: gz, halfWidth: 0.3, halfDepth: halfLen, topY: 11, walkable: false },
      { type: "box", x: gx, z: gz + (halfLen - 0.2), halfWidth: 9.8, halfDepth: 0.3, topY: 11, walkable: false },
      { type: "box", x: gx, z: gz - (halfLen - 0.3), halfWidth: 9.8, halfDepth: 0.3, topY: 11, walkable: false },
      // Bancos internos da galeria (pisáveis)
      { type: "box", x: gx - 5.2, z: gz - 2.5, halfWidth: 0.85, halfDepth: 2.1, topY: 0.76, walkable: true },
      { type: "box", x: gx + 5.2, z: gz - 2.5, halfWidth: 0.85, halfDepth: 2.1, topY: 0.76, walkable: true },
      // Vasos nos cantos do fundo da galeria
      { type: "circle", x: gx - 7.8, z: gz + (halfLen - 1.6), radius: 0.85, topY: 2.2, walkable: false },
      { type: "circle", x: gx + 7.8, z: gz + (halfLen - 1.6), radius: 0.85, topY: 2.2, walkable: false },
      ...totemColliders,
    ]
  }

  return [
    // Palco principal e degraus frontais (superfícies onde o avatar pode subir)
    { type: "box", x: 0, z: -20, halfWidth: 12.5, halfDepth: 4.5, topY: 2.2, walkable: true },
    { type: "box", x: 0, z: -19.3, halfWidth: 11.25, halfDepth: 3.6, topY: 2.3, walkable: true },
    { type: "box", x: 0, z: -15.1, halfWidth: 5.5, halfDepth: 0.55, topY: 1.5, walkable: true },
    { type: "box", x: 0, z: -14.2, halfWidth: 6.2, halfDepth: 0.55, topY: 0.75, walkable: true },

    // Telão e painéis ripados sobre o palco (barreiras sólidas)
    { type: "box", x: 0, z: -22.7, halfWidth: 12.2, halfDepth: 0.45, topY: 16, walkable: false },

    // Paredes arquitetônicas laterais
    { type: "box", x: -34, z: -2, halfWidth: 2.5, halfDepth: 26, topY: 14, walkable: false },
    { type: "box", x: 34, z: -2, halfWidth: 2.5, halfDepth: 26, topY: 14, walkable: false },

    // Bancos estofados da praça (superfícies onde o avatar pode subir)
    { type: "box", x: -16, z: 4, halfWidth: 2.1, halfDepth: 0.72, rotationY: 0.12, topY: 0.76, walkable: true },
    { type: "box", x: 16, z: 4, halfWidth: 2.1, halfDepth: 0.72, rotationY: -0.12, topY: 0.76, walkable: true },
    { type: "box", x: -12, z: 14, halfWidth: 2.1, halfDepth: 0.72, rotationY: 0, topY: 0.76, walkable: true },
    { type: "box", x: 12, z: 14, halfWidth: 2.1, halfDepth: 0.72, rotationY: 0, topY: 0.76, walkable: true },

    // Vasos / jardineiras (barreiras sólidas)
    { type: "circle", x: -15.6, z: 14, radius: 1.1, topY: 2.2, walkable: false },
    { type: "circle", x: 15.6, z: 14, radius: 1.1, topY: 2.2, walkable: false },
    { type: "circle", x: -27, z: 10, radius: 1.05, topY: 2.2, walkable: false },
    { type: "circle", x: 27, z: 10, radius: 1.05, topY: 2.2, walkable: false },
    { type: "circle", x: -27, z: -10, radius: 1.05, topY: 2.2, walkable: false },
    { type: "circle", x: 27, z: -10, radius: 1.05, topY: 2.2, walkable: false },
  ]
}

function MediaSurface({
  url,
  mediaType,
  width,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fallbackColor = "#030304",
  fallbackEmissive,
  fallbackEmissiveIntensity = 0,
}: {
  url?: string
  mediaType?: MediaType
  width: number
  height: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  fallbackColor?: string
  fallbackEmissive?: string
  fallbackEmissiveIntensity?: number
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const cleanUrl = url?.trim() || ""

  useEffect(() => {
    if (!cleanUrl) {
      setTexture(null)
      return
    }

    const isVideo =
      mediaType === "video" ||
      /\.(mp4|webm|mov|m4v|ogg|ogv)(\?.*)?$/i.test(cleanUrl)

    if (isVideo) {
      const video = document.createElement("video")
      video.src = cleanUrl
      video.crossOrigin = "anonymous"
      video.loop = true
      video.muted = true
      video.playsInline = true
      video.autoplay = true
      video.preload = "auto"

      const vidTex = new THREE.VideoTexture(video)
      vidTex.colorSpace = THREE.SRGBColorSpace
      vidTex.minFilter = THREE.LinearFilter
      vidTex.magFilter = THREE.LinearFilter
      vidTex.generateMipmaps = false

      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }

      setTexture(vidTex)

      return () => {
        video.pause()
        video.removeAttribute("src")
        video.load()
        vidTex.dispose()
      }
    } else {
      let active = true
      const loader = new THREE.TextureLoader()
      loader.setCrossOrigin("anonymous")
      loader.load(
        cleanUrl,
        (loadedTex) => {
          if (!active) {
            loadedTex.dispose()
            return
          }
          loadedTex.colorSpace = THREE.SRGBColorSpace
          loadedTex.needsUpdate = true
          setTexture(loadedTex)
        },
        undefined,
        () => {
          if (active) setTexture(null)
        }
      )

      return () => {
        active = false
      }
    }
  }, [cleanUrl, mediaType])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshBasicMaterial key={`tex-${cleanUrl}`} map={texture} toneMapped={false} />
      ) : fallbackEmissive ? (
        <meshStandardMaterial
          key="fallback-std"
          color={fallbackColor}
          emissive={fallbackEmissive}
          emissiveIntensity={fallbackEmissiveIntensity}
          roughness={0.4}
        />
      ) : (
        <meshBasicMaterial key="fallback-basic" color={fallbackColor} />
      )}
    </mesh>
  )
}

function NeonBorder({
  width,
  height,
  thickness = 0.07,
  color = GOLD_LED,
  zOffset = 0.02,
}: {
  width: number
  height: number
  thickness?: number
  color?: string
  zOffset?: number
}) {
  return (
    <group position={[0, 0, zOffset]}>
      {/* Top */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + thickness, thickness, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[width + thickness, thickness, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function Chandelier() {
  return (
    <group position={[0, 14.2, 4]}>
      {/* Cabos de suspensão */}
      {[-3.2, 3.2].map((x) =>
        [-3.2, 3.2].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 2.2, z]}>
            <cylinderGeometry args={[0.02, 0.02, 4.4, 6]} />
            <meshBasicMaterial color="#3a2d27" />
          </mesh>
        ))
      )}

      {/* Anel externo principal */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.2, 0.16, 10, 48]} />
        <meshStandardMaterial color="#231b17" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.2, 0.09, 8, 48]} />
        <meshBasicMaterial color="#ffbe73" />
      </mesh>

      {/* Segundo anel concêntrico menor */}
      <mesh position={[0, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.13, 10, 40]} />
        <meshStandardMaterial color="#231b17" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.94, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.075, 8, 40]} />
        <meshBasicMaterial color="#ffbe73" />
      </mesh>

      <pointLight position={[0, -1.2, 0]} color="#ffc88a" intensity={38} distance={65} decay={1.5} />
    </group>
  )
}

function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Reflexo suave dourado no piso sob a fita de LED */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.28, 1.56]} />
        <meshBasicMaterial color="#d88236" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* Fita de LED dourada na base (underglow) */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[4.04, 0.055, 1.32]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>
      {/* Base escura recuada */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3.98, 0.36, 1.26]} />
        <meshStandardMaterial color="#1e1715" roughness={0.45} metalness={0.4} />
      </mesh>
      {/* Almofada superior estofada em tom taupe quente */}
      <mesh position={[0, 0.56, 0]}>
        <boxGeometry args={[4.12, 0.28, 1.36]} />
        <meshStandardMaterial color="#4a3a32" roughness={0.62} metalness={0.08} />
      </mesh>
    </group>
  )
}

function Planter({ position, glowingBase = false }: { position: [number, number, number]; glowingBase?: boolean }) {
  return (
    <group position={position}>
      {glowingBase && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.92, 1.0, 24]} />
          <meshBasicMaterial color={GOLD_LED} />
        </mesh>
      )}
      <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.95, 0.8, 0.96, 20]} />
        <meshStandardMaterial color="#231c19" roughness={0.78} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 16]} />
        <meshBasicMaterial color="#3b2819" />
      </mesh>
      {[
        [-0.3, 0.2, -0.25, 0.2],
        [0.3, -0.15, 0.25, -0.22],
        [0.12, 0.32, 0.15, 0.28],
        [-0.15, -0.28, -0.18, -0.25],
        [0, 0, 0, 0],
      ].map(([x, z, rx, rz], index) => (
        <mesh
          key={index}
          castShadow
          position={[x, 1.35 + (index % 2) * 0.22, z]}
          rotation={[rx, index * 0.7, rz]}
        >
          <coneGeometry args={[0.36, 1.55, 6]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#4e6138" : "#3b4c29"} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function Stage({ config }: { config: StageMediaConfig }) {
  const hasMedia = Boolean(config.url?.trim())

  return (
    <group position={[0, 0, -20]}>
      {/* Plataforma base do palco */}
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[25, 2.2, 9]} />
        <meshStandardMaterial color="#1c1614" roughness={0.55} metalness={0.3} />
      </mesh>
      {/* Fita de LED dourada na borda frontal do palco */}
      <mesh position={[0, 2.21, 4.51]}>
        <boxGeometry args={[25.05, 0.06, 0.06]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>
      <mesh position={[0, 0.04, 4.51]}>
        <boxGeometry args={[25.05, 0.06, 0.06]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>

      {/* Degraus frontais iluminados (permitem subir caminhando ou pulando) */}
      <mesh receiveShadow position={[0, 0.75, 5.1]}>
        <boxGeometry args={[11, 1.5, 1.2]} />
        <meshStandardMaterial color="#231b18" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.51, 5.71]}>
        <boxGeometry args={[11.04, 0.05, 0.05]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>
      <mesh receiveShadow position={[0, 0.38, 6.0]}>
        <boxGeometry args={[12.4, 0.76, 1.2]} />
        <meshStandardMaterial color="#231b18" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.76, 6.61]}>
        <boxGeometry args={[12.44, 0.05, 0.05]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>

      {/* Piso superior do palco */}
      <mesh receiveShadow position={[0, 2.22, 0.5]}>
        <boxGeometry args={[22.5, 0.14, 7.4]} />
        <meshStandardMaterial color="#3c302b" roughness={0.48} metalness={0.2} />
      </mesh>

      {/* Painéis ripados de madeira nas laterais do telão */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 11.4, 8.2, -2.6]}>
          <mesh>
            <boxGeometry args={[3.2, 12.2, 0.35]} />
            <meshStandardMaterial color="#17110e" roughness={0.85} />
          </mesh>
          {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((sx) => (
            <mesh key={sx} position={[sx, 0, 0.2]}>
              <boxGeometry args={[0.14, 12.1, 0.12]} />
              <meshStandardMaterial color="#4b3324" roughness={0.7} />
            </mesh>
          ))}
          {/* Luz dourada na base do ripado */}
          <mesh position={[0, -5.95, 0.3]}>
            <boxGeometry args={[3.1, 0.07, 0.08]} />
            <meshBasicMaterial color={GOLD_LED} />
          </mesh>
        </group>
      ))}

      {/* Moldura do Telão 16:9 (1920x1080 -> 19.2m x 10.8m) */}
      <mesh castShadow position={[0, 8.4, -2.6]}>
        <boxGeometry args={[19.8, 11.4, 0.5]} />
        <meshStandardMaterial color="#120f0e" roughness={0.3} metalness={0.85} />
      </mesh>

      <group position={[0, 8.4, -2.3]}>
        {hasMedia ? (
          <MediaSurface
            url={config.url}
            mediaType={config.mediaType}
            width={19.2}
            height={10.8}
            fallbackColor="#120f0e"
          />
        ) : (
          <mesh>
            <planeGeometry args={[19.2, 10.8]} />
            <meshStandardMaterial color="#141110" emissive="#251a14" emissiveIntensity={0.45} roughness={0.35} />
          </mesh>
        )}
        <NeonBorder width={19.28} height={10.88} thickness={0.08} color={GOLD_LED} zOffset={0.02} />
      </group>

      {config.showTextOverlay && (
        <>
          {config.title && (
            <Text position={[0, 9.1, -2.18]} fontSize={1.15} letterSpacing={0.22} color="#ffffff" anchorX="center" anchorY="middle">
              {config.title}
            </Text>
          )}
          {config.subtitle && (
            <Text position={[0, 7.45, -2.17]} fontSize={0.34} letterSpacing={0.34} color="#d6c5b7" anchorX="center" anchorY="middle">
              {config.subtitle}
            </Text>
          )}
          <mesh position={[0, 6.65, -2.18]}>
            <planeGeometry args={[1.6, 0.04]} />
            <meshBasicMaterial color={GOLD_LED} />
          </mesh>
        </>
      )}
    </group>
  )
}

function ProjectPortal({
  index,
  totalCount,
  title,
}: {
  index: number
  totalCount: number
  title: string
}) {
  const { side, position } = getPlazaPortal(index, totalCount)
  const facing = side < 0 ? Math.PI / 2 : -Math.PI / 2

  return (
    <group position={position} rotation={[0, facing, 0]}>
      {/* Placa escura com o nome do projeto/categoria acima da porta */}
      <mesh castShadow position={[0, 5.5, 0.05]}>
        <boxGeometry args={[4.8, 0.92, 0.34]} />
        <meshStandardMaterial color="#1f1815" metalness={0.25} roughness={0.6} />
      </mesh>
      <Text
        position={[0, 5.5, -0.14]}
        fontSize={0.26}
        maxWidth={4.3}
        letterSpacing={0.12}
        textAlign="center"
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {title.toUpperCase()}
      </Text>

      {/* Batente arquitetônico escuro */}
      <mesh castShadow position={[-1.65, 2.45, 0]}>
        <boxGeometry args={[0.32, 4.9, 0.5]} />
        <meshStandardMaterial color="#2a201b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[1.65, 2.45, 0]}>
        <boxGeometry args={[0.32, 4.9, 0.5]} />
        <meshStandardMaterial color="#2a201b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 4.82, 0]}>
        <boxGeometry args={[3.62, 0.32, 0.5]} />
        <meshStandardMaterial color="#2a201b" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Fita de LED dourada sob a verga da porta */}
      <mesh position={[0, 4.64, -0.22]}>
        <boxGeometry args={[2.95, 0.05, 0.05]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>

      {/* Folhas duplas da porta em tom bronze/caramelo quente */}
      <mesh castShadow position={[0, 2.35, -0.05]}>
        <boxGeometry args={[2.95, 4.55, 0.3]} />
        <meshStandardMaterial
          color="#7c5236"
          emissive="#54331d"
          emissiveIntensity={0.35}
          metalness={0.22}
          roughness={0.52}
        />
      </mesh>
      {/* Fresta vertical central da porta dupla */}
      <mesh position={[0, 2.35, -0.21]}>
        <boxGeometry args={[0.04, 4.5, 0.02]} />
        <meshBasicMaterial color="#23150e" />
      </mesh>
      {/* Puxadores verticais */}
      {[-0.18, 0.18].map((hx) => (
        <mesh key={hx} position={[hx, 2.25, -0.23]}>
          <boxGeometry args={[0.03, 0.55, 0.04]} />
          <meshStandardMaterial color="#d8a878" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* Fita de LED dourada na soleira */}
      <mesh position={[0, 0.04, -0.22]}>
        <boxGeometry args={[3.0, 0.045, 0.06]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>
    </group>
  )
}

function InteractiveTotem({
  frame,
  position,
  rotation,
  hideLabel = false,
  onInspect,
}: {
  frame: MediaFrameItem
  position: [number, number, number]
  rotation: [number, number, number]
  hideLabel?: boolean
  onInspect: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation()
        onInspect()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = "auto"
      }}
    >
      {/* Corpo inferior do totem com contorno em LED dourado */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.56, 0.88, 0.42]} />
        <meshStandardMaterial color="#191311" metalness={0.65} roughness={0.35} />
      </mesh>
      <NeonBorder width={0.54} height={0.84} thickness={0.025} color={GOLD_LED} zOffset={0.215} />

      {/* Reflexo suave dourado no piso sob o totem */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.76, 0.62]} />
        <meshBasicMaterial color="#d88236" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* Fita de LED dourada na base do totem */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.62, 0.04, 0.48]} />
        <meshBasicMaterial color={GOLD_LED} />
      </mesh>

      {/* Painel touch inclinado no topo do totem com contorno dourado */}
      <group position={[0, 1.06, 0.02]} rotation={[-0.62, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.64, 0.48, 0.06]} />
          <meshStandardMaterial color="#16110f" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[0.56, 0.4]} />
          <meshStandardMaterial
            color="#211712"
            emissive={hovered ? "#c48857" : "#5e3d26"}
            emissiveIntensity={hovered ? 1.5 : 0.7}
            roughness={0.25}
          />
        </mesh>
        <NeonBorder width={0.58} height={0.42} thickness={0.024} color={GOLD_LED} zOffset={0.035} />
        <Text
          position={[0, 0.04, 0.04]}
          fontSize={0.052}
          maxWidth={0.5}
          textAlign="center"
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {frame.title || "PROJETO"}
        </Text>
        <Text
          position={[0, -0.1, 0.04]}
          fontSize={0.036}
          letterSpacing={0.14}
          color="#f7c18e"
          anchorX="center"
          anchorY="middle"
        >
          INTERAGIR
        </Text>
      </group>

      {/* Pílula flutuante igual à referência ("Campanhas ›" / "Ver Projeto ›") */}
      {!hideLabel && (
        <Html position={[0, 1.58, 0]} center distanceFactor={11} zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onInspect()
            }}
            className="group flex items-center gap-2 whitespace-nowrap rounded-full border border-[#d88b48]/45 bg-[#19120e]/95 px-4 py-1.5 text-xs font-medium text-white shadow-[0_8px_28px_rgba(0,0,0,0.65)] backdrop-blur-md transition hover:scale-105 hover:border-[#f3b178] hover:bg-[#6e3f20]"
          >
            <span>{frame.totemLabel?.trim() || frame.title || "Ver Projeto"}</span>
            <span className="text-[#f0a868] transition-transform group-hover:translate-x-0.5 group-hover:text-white">
              ›
            </span>
          </button>
        </Html>
      )}
    </group>
  )
}

function GalleryRoom({
  index,
  room,
  hideLabels = false,
  onInspectFrame,
}: {
  index: number
  room: GalleryRoomConfig
  hideLabels?: boolean
  onInspectFrame?: (frame: MediaFrameItem, roomTitle: string) => void
}) {
  const [x, , z] = getGalleryCenter(index)
  // Proporção exata 16:9 (1920x1080) para o telão do fundo da sala: 19.2m x 10.8m
  const roomWidth = 19.2
  const roomLength = getGalleryRoomLength(room)
  const halfLen = roomLength / 2
  const wallHeight = 10.8
  const hasBackMedia = Boolean(room.backWall?.url?.trim())

  const leftZPositions = useMemo(
    () => getFrameZPositions(room.leftFrames.length, roomLength),
    [room.leftFrames.length, roomLength]
  )
  const rightZPositions = useMemo(
    () => getFrameZPositions(room.rightFrames.length, roomLength),
    [room.rightFrames.length, roomLength]
  )

  return (
    <group position={[x, 0, z]}>
      {/* Piso polido em tom taupe/bronze quente */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomWidth, roomLength]} />
        <meshStandardMaterial color="#4e3b31" roughness={0.55} metalness={0.18} />
      </mesh>

      {/* Teto fechado com lustre circular central e trilhos de spots */}
      <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomWidth, roomLength]} />
        <meshStandardMaterial color="#241914" roughness={0.88} />
      </mesh>
      <mesh position={[0, wallHeight - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.6, roomLength]} />
        <meshStandardMaterial color="#1b120e" roughness={0.92} />
      </mesh>

      {/* Lustre anelar dourado no centro do teto da sala */}
      <group position={[0, wallHeight - 0.9, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.9, 0.12, 10, 44]} />
          <meshStandardMaterial color="#231a16" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.9, 0.07, 8, 44]} />
          <meshBasicMaterial color="#ffbe73" />
        </mesh>
      </group>

      {/* Trilhos de iluminação no teto (esquerdo e direito) */}
      {[-6.2, 6.2].map((tx) => (
        <group key={tx} position={[tx, wallHeight - 0.15, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.12, roomLength - 6]} />
            <meshBasicMaterial color="#0e0b0a" />
          </mesh>
          {[-8, -3, 2, 7].map((tz) => (
            <mesh key={tz} position={[0, -0.14, tz]}>
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshBasicMaterial color="#ffd29d" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Parede do fundo com ripado nas laterais e quadro central 16:9 (13.44m x 7.56m = 1920x1080) */}
      <group position={[0, wallHeight / 2, halfLen - 0.25]} rotation={[0, Math.PI, 0]}>
        {/* Parede estrutural escura ao fundo */}
        <mesh>
          <planeGeometry args={[roomWidth, wallHeight]} />
          <meshStandardMaterial color="#18120f" roughness={0.85} />
        </mesh>

        {/* Quadro / Telão central 16:9 onde fica o vídeo ou imagem */}
        <MediaSurface
          url={room.backWall?.url}
          mediaType={room.backWall?.mediaType}
          width={13.44}
          height={7.56}
          position={[0, 0, 0.03]}
          fallbackColor="#110d0b"
        />
        <NeonBorder width={13.48} height={7.6} thickness={0.07} color={GOLD_LED} zOffset={0.04} />

        {/* Quando não há vídeo/imagem no quadro central, exibe o texto editorial */}
        {!hasBackMedia && (
          <group position={[0, 0, 0.06]}>
            <Text position={[0, 1.85, 0]} fontSize={0.28} letterSpacing={0.32} color="#d6c5b7" anchorX="center">
              PORTFÓLIO
            </Text>
            <Text position={[0, 0.9, 0]} fontSize={0.95} letterSpacing={0.22} color="#ffffff" anchorX="center">
              JORGE AOR
            </Text>
            <Text
              position={[0, -0.35, 0]}
              fontSize={0.22}
              letterSpacing={0.24}
              color="#cbb8a9"
              anchorX="center"
            >
              {room.title.toUpperCase()}
            </Text>
          </group>
        )}

        {/* Painéis ripados nos cantos da parede do fundo */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 8.1, 0, 0.08]}>
            {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((sx) => (
              <mesh key={sx} position={[sx, 0, 0]}>
                <boxGeometry args={[0.14, wallHeight - 0.4, 0.14]} />
                <meshStandardMaterial color="#3c281c" roughness={0.75} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Vasos decorativos nos cantos do fundo da sala */}
      <Planter position={[-7.8, 0, halfLen - 1.6]} />
      <Planter position={[7.8, 0, halfLen - 1.6]} />

      {/* Dois bancos estofados com underglow dourado dentro da sala */}
      <Bench position={[-5.2, 0, -2.5]} rotation={Math.PI / 2} />
      <Bench position={[5.2, 0, -2.5]} rotation={-Math.PI / 2} />

      {/* Paredes laterais com rodapé iluminado em LED dourado, quadros e totens */}
      {([-1, 1] as const).map((side) => {
        const frames = side < 0 ? room.leftFrames : room.rightFrames
        const zPositions = side < 0 ? leftZPositions : rightZPositions
        const facingY = side < 0 ? Math.PI / 2 : -Math.PI / 2

        return (
          <group key={side}>
            <mesh receiveShadow position={[side * (roomWidth / 2), wallHeight / 2, 0]}>
              <boxGeometry args={[0.35, wallHeight, roomLength]} />
              <meshStandardMaterial color="#322119" roughness={0.82} metalness={0.06} />
            </mesh>

            {/* Rodapé iluminado em LED dourado contínuo */}
            <mesh position={[side * (roomWidth / 2 - 0.19), 0.04, 0]}>
              <boxGeometry args={[0.05, 0.07, roomLength]} />
              <meshBasicMaterial color={GOLD_LED} />
            </mesh>

            {frames.map((frame, frameIdx) => {
              const frameZ = zPositions[frameIdx] ?? 0
              const fw = frame.width || 5.8
              const fh = frame.height || 3.85
              return (
                <group key={frame.id}>
                  {/* Quadro na parede */}
                  <group
                    position={[side * (roomWidth / 2 - 0.2), 4.6, frameZ]}
                    rotation={[0, facingY, 0]}
                  >
                    <mesh castShadow>
                      <boxGeometry args={[fw, fh, 0.18]} />
                      <meshStandardMaterial color="#120e0d" roughness={0.5} metalness={0.4} />
                    </mesh>
                    <MediaSurface
                      url={frame.url}
                      mediaType={frame.mediaType}
                      width={fw - 0.18}
                      height={fh - 0.18}
                      position={[0, 0, 0.1]}
                      fallbackColor="#050404"
                    />
                  </group>

                  {/* Totem interativo embaixo do quadro */}
                  {frame.totemEnabled !== false && (
                    <InteractiveTotem
                      frame={frame}
                      position={[side * (roomWidth / 2 - 1.25), 0, frameZ]}
                      rotation={[0, facingY, 0]}
                      hideLabel={hideLabels}
                      onInspect={() => onInspectFrame?.(frame, room.title)}
                    />
                  )}
                </group>
              )
            })}
          </group>
        )
      })}

      {/* Parede traseira e portal de retorno à praça */}
      <mesh receiveShadow position={[0, wallHeight / 2, -(halfLen - 0.15)]}>
        <boxGeometry args={[roomWidth, wallHeight, 0.35]} />
        <meshStandardMaterial color="#241813" roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 2.4, -(halfLen - 0.38)]}>
        <boxGeometry args={[5.2, 4.8, 0.25]} />
        <meshStandardMaterial color="#171312" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.35, -(halfLen - 0.54)]}>
        <planeGeometry args={[4.25, 3.8]} />
        <meshStandardMaterial color="#5e3d28" emissive="#8c5630" emissiveIntensity={0.75} />
      </mesh>
      <Text position={[0, 2.3, -(halfLen - 0.68)]} fontSize={0.25} letterSpacing={0.18} color={IVORY} anchorX="center">
        VOLTAR À PRAÇA
      </Text>

      {/* Iluminação interna otimizada (apenas 2 luzes para fluidez máxima) */}
      <pointLight position={[0, 7.8, -3]} color="#ffc88a" intensity={16} distance={36} decay={1.6} />
      <pointLight position={[0, 7.8, 7]} color="#f0b074" intensity={12} distance={32} decay={1.7} />
    </group>
  )
}

interface CyberPlazaScenarioProps {
  playerCoords?: { x: number; y: number; z: number }
  activeGallery?: number | null
  hideLabels?: boolean
  onEnterGallery?: (index: number) => void
  onExitGallery?: () => void
  onInspectFrame?: (frame: MediaFrameItem, roomTitle: string) => void
  cmsData?: MetaverseCMSData
}

export function CyberPlazaScenario({
  playerCoords = { x: 0, y: 0, z: 18 },
  activeGallery = null,
  hideLabels = false,
  onEnterGallery,
  onExitGallery,
  onInspectFrame,
  cmsData: externalCmsData,
}: CyberPlazaScenarioProps) {
  const portalLock = useRef(false)
  const defaultCms = useMemo(() => createDefaultMetaverseCMSData(), [])
  const cmsData = externalCmsData || defaultCms
  const galleries = cmsData.galleries.length > 0 ? cmsData.galleries : defaultCms.galleries

  useEffect(() => {
    if (portalLock.current || !onEnterGallery || !onExitGallery) return

    if (activeGallery === null) {
      const portalIndex = galleries.findIndex((_, index) => {
        const [x, , z] = getPlazaPortal(index, galleries.length).position
        return Math.abs(playerCoords.x - x) < 2.2 && Math.abs(playerCoords.z - z) < 2.2
      })
      if (portalIndex >= 0) {
        portalLock.current = true
        onEnterGallery(portalIndex)
        window.setTimeout(() => { portalLock.current = false }, 900)
      }
      return
    }

    const [galleryX, , galleryZ] = getGalleryCenter(activeGallery)
    const room = galleries[activeGallery]
    const halfLen = getGalleryRoomLength(room) / 2
    if (Math.abs(playerCoords.x - galleryX) < 3 && playerCoords.z < galleryZ - (halfLen - 2.5)) {
      portalLock.current = true
      onExitGallery()
      window.setTimeout(() => { portalLock.current = false }, 900)
    }
  }, [activeGallery, galleries, onEnterGallery, onExitGallery, playerCoords])

  const leftPlazaFrames = useMemo(
    () => cmsData.plazaFrames.filter((f) => f.side === "left"),
    [cmsData.plazaFrames]
  )
  const rightPlazaFrames = useMemo(
    () => cmsData.plazaFrames.filter((f) => f.side === "right"),
    [cmsData.plazaFrames]
  )

  return (
    <group>
      <ambientLight intensity={1.4} color="#dfcab8" />
      <hemisphereLight args={["#ebd5c3", "#36261e", 1.8]} />
      <directionalLight
        castShadow={activeGallery === null}
        position={[16, 28, 14]}
        intensity={2.7}
        color="#ffd8b3"
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={90}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />

      <Chandelier />

      {/* Piso principal da praça em tom pedra/bronze quente */}
      <mesh receiveShadow position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#362c27" roughness={0.62} metalness={0.18} />
      </mesh>

      {/* Linhas de piso sutis em bronze */}
      {Array.from({ length: 13 }, (_, index) => -36 + index * 6).map((x) => (
        <mesh key={`x-${x}`} position={[x, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.035, 80]} />
          <meshBasicMaterial color="#87664e" transparent opacity={0.32} />
        </mesh>
      ))}
      {Array.from({ length: 13 }, (_, index) => -36 + index * 6).map((z) => (
        <mesh key={`z-${z}`} position={[0, -0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 0.035]} />
          <meshBasicMaterial color="#755a47" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* Chevrons luminosos (>>>) no piso guiando o visitante em direção ao palco */}
      {[20.6, 21.3, 22.0].map((cz, i) => (
        <group key={cz} position={[0, 0.015, cz]}>
          <mesh position={[-0.28, 0, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.1, 0.65]} />
            <meshBasicMaterial color={GOLD_LED} transparent opacity={0.95 - i * 0.18} />
          </mesh>
          <mesh position={[0.28, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.1, 0.65]} />
            <meshBasicMaterial color={GOLD_LED} transparent opacity={0.95 - i * 0.18} />
          </mesh>
        </group>
      ))}

      {/* Arcos luminosos curvos decorativos no piso nas laterais */}
      {[-1, 1].map((side) => (
        <mesh
          key={`arc-${side}`}
          position={[side * 24, 0.012, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[8.5, 8.58, 40]} />
          <meshBasicMaterial color={GOLD_LED} transparent opacity={0.55} />
        </mesh>
      ))}

      <Stage config={cmsData.stage} />

      {/* Paredões arquitetônicos laterais com sanca de LED dourada e quadros */}
      {([-1, 1] as const).map((side) => {
        const wallFrames = side < 0 ? leftPlazaFrames : rightPlazaFrames
        return (
          <group key={side} position={[side * 34, 0, -2]}>
            <mesh castShadow receiveShadow position={[0, 7, 0]}>
              <boxGeometry args={[5, 14, 52]} />
              <meshStandardMaterial color={CHARCOAL} roughness={0.68} metalness={0.2} />
            </mesh>
            {/* Sanca de LED dourada no topo e rodapé do paredão */}
            <mesh position={[-side * 2.52, 13.85, 0]}>
              <boxGeometry args={[0.08, 0.08, 52]} />
              <meshBasicMaterial color={GOLD_LED} />
            </mesh>
            <mesh position={[-side * 2.52, 0.05, 0]}>
              <boxGeometry args={[0.06, 0.06, 52]} />
              <meshBasicMaterial color={GOLD_LED} />
            </mesh>

            {wallFrames.map((frame, idx) => (
              <MediaSurface
                key={frame.id}
                url={frame.url}
                mediaType={frame.mediaType}
                width={5.5}
                height={4.3}
                position={[-side * 2.53, 8.8, frame.zOffset]}
                rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
                fallbackColor={idx % 2 === 0 ? "#4d382c" : "#2f241f"}
                fallbackEmissive={idx % 2 === 0 ? "#38251a" : "#1f1815"}
                fallbackEmissiveIntensity={0.45}
              />
            ))}
          </group>
        )
      })}

      {galleries.map((gallery, index) => (
        <ProjectPortal
          key={gallery.id}
          index={index}
          totalCount={galleries.length}
          title={gallery.title}
        />
      ))}

      {activeGallery !== null && galleries[activeGallery] && (
        <GalleryRoom
          key={`gallery-${activeGallery}`}
          index={activeGallery}
          room={galleries[activeGallery]}
          hideLabels={hideLabels}
          onInspectFrame={onInspectFrame}
        />
      )}

      {/* Bancos estofados com underglow dourado e vasos */}
      <Bench position={[-16, 0, 4]} rotation={0.12} />
      <Bench position={[16, 0, 4]} rotation={-0.12} />
      <Bench position={[-12, 0, 14]} rotation={0} />
      <Bench position={[12, 0, 14]} rotation={0} />

      <Planter position={[-15.6, 0, 14]} glowingBase />
      <Planter position={[15.6, 0, 14]} glowingBase />
      <Planter position={[-27, 0, 10]} />
      <Planter position={[27, 0, 10]} />
      <Planter position={[-27, 0, -10]} />
      <Planter position={[27, 0, -10]} />
    </group>
  )
}
