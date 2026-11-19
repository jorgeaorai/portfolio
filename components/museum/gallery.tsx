"use client"

import { Sculpture } from "./sculpture"
import { ARTWORKS } from "./artworks"
import { DynamicArtifact } from "./dynamic-artifact"
import { MuseumArtifact } from "@/lib/types/artifact"

const HALF_W = 8
const HALF_L = 22
const WALL_H = 6

function Wall({
  position,
  rotation,
  width,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, WALL_H]} />
      <meshStandardMaterial color="#f4f2ec" roughness={0.95} metalness={0} />
    </mesh>
  )
}

export function Gallery({
  activeId,
  dynamicArtifacts = [],
}: {
  activeId: string | null
  dynamicArtifacts?: MuseumArtifact[]
}) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, HALF_L * 2]} />
        <meshStandardMaterial color="#c9c4ba" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Central carpet guide */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, HALF_L * 2]} />
        <meshStandardMaterial color="#8a8478" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[HALF_W * 2, HALF_L * 2]} />
        <meshStandardMaterial color="#e9e6df" roughness={1} />
      </mesh>

      {/* Side walls */}
      <Wall position={[-HALF_W, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} width={HALF_L * 2} />
      <Wall position={[HALF_W, WALL_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} width={HALF_L * 2} />
      {/* End walls */}
      <Wall position={[0, WALL_H / 2, -HALF_L]} rotation={[0, 0, 0]} width={HALF_W * 2} />
      <Wall position={[0, WALL_H / 2, HALF_L]} rotation={[0, Math.PI, 0]} width={HALF_W * 2} />

      {/* Gallery Ambient & Directional Lights */}
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#b6b0a4", 0.6]} />
      <directionalLight
        position={[0, WALL_H - 0.5, 0]}
        intensity={0.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Ceiling spotlights */}
      {[-16, -8, 0, 8, 16].map((z) => (
        <pointLight key={z} position={[0, WALL_H - 0.3, z]} intensity={2} distance={12} color="#fff6e8" />
      ))}

      {/* Static Sculptures */}
      {ARTWORKS.map((art) => (
        <Sculpture key={art.id} artwork={art} active={activeId === art.id} />
      ))}

      {/* Dynamic Published 3D Artifacts */}
      {dynamicArtifacts.map((art) => (
        <DynamicArtifact
          key={art.id}
          artifact={art}
          active={activeId === art.id}
          isProximity={activeId === art.id}
        />
      ))}
    </group>
  )
}
