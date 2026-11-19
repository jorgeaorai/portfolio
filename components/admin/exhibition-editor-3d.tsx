"use client"

import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, TransformControls, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { MuseumArtifact } from "@/lib/types/artifact"

type TransformMode = "translate" | "rotate" | "scale"

interface EditorSceneProps {
  artifact: Partial<MuseumArtifact>
  transformMode: TransformMode
  onTransformChange: (transform: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
  }) => void
  onModelAnalyzed?: (stats: { triangles: number; materials: number; warning?: string }) => void
}

function GlbModel({
  url,
  artifact,
  onModelAnalyzed,
}: {
  url: string
  artifact: Partial<MuseumArtifact>
  onModelAnalyzed?: (stats: { triangles: number; materials: number; warning?: string }) => void
}) {
  const { scene } = useGLTF(url)
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    let triangles = 0
    const materialSet = new Set<string>()

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.geometry) {
          const count = mesh.geometry.index
            ? mesh.geometry.index.count / 3
            : mesh.geometry.attributes.position.count / 3
          triangles += Math.floor(count)
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => materialSet.add(m.name || m.uuid))
          } else {
            materialSet.add(mesh.material.name || mesh.material.uuid)
          }
        }
        child.castShadow = artifact.shadows_enabled ?? true
        child.receiveShadow = artifact.shadows_enabled ?? true
      }
    })

    let warning: string | undefined
    if (triangles > 250000) {
      warning = `High polygon count (${triangles.toLocaleString()} triangles). May impact performance on mobile devices.`
    }

    if (onModelAnalyzed) {
      onModelAnalyzed({
        triangles,
        materials: materialSet.size,
        warning,
      })
    }
  }, [clonedScene, artifact.shadows_enabled, onModelAnalyzed])

  return <primitive object={clonedScene} />
}

export function ExhibitionEditor3D({
  artifact,
  transformMode,
  onTransformChange,
  onModelAnalyzed,
}: EditorSceneProps) {
  const groupRef = useRef<THREE.Group>(null)

  const pos: [number, number, number] = [
    artifact.position_x ?? 0,
    artifact.position_y ?? 1.4,
    artifact.position_z ?? 0,
  ]
  const rot: [number, number, number] = [
    artifact.rotation_x ?? 0,
    artifact.rotation_y ?? 0,
    artifact.rotation_z ?? 0,
  ]
  const scl: [number, number, number] = [
    artifact.scale_x ?? 1,
    artifact.scale_y ?? 1,
    artifact.scale_z ?? 1,
  ]

  // Snap to floor helper function
  const handleSnapToFloor = () => {
    if (!groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const minY = box.min.y
    const currentY = groupRef.current.position.y
    const floorY = 0 // floor level is Y = 0
    const diff = currentY - minY
    const newY = floorY + diff
    onTransformChange({
      position: [groupRef.current.position.x, newY, groupRef.current.position.z],
      rotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z],
      scale: [groupRef.current.scale.x, groupRef.current.scale.y, groupRef.current.scale.z],
    })
  }

  // Center model origin helper function
  const handleCenterOrigin = () => {
    if (!groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const center = new THREE.Vector3()
    box.getCenter(center)
    groupRef.current.position.sub(center)
    onTransformChange({
      position: [groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z],
      rotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z],
      scale: [groupRef.current.scale.x, groupRef.current.scale.y, groupRef.current.scale.z],
    })
  }

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border bg-black/40">
      {/* Action shortcuts */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={handleSnapToFloor}
          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md backdrop-blur-md border border-border transition-colors"
        >
          Snap to Floor
        </button>
        <button
          type="button"
          onClick={handleCenterOrigin}
          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md backdrop-blur-md border border-border transition-colors"
        >
          Center Origin
        </button>
      </div>

      <Canvas
        shadows
        camera={{ position: [pos[0] + 3, pos[1] + 2, pos[2] + 4], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#16161a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={artifact.light_intensity ?? 4}
          castShadow={artifact.shadows_enabled ?? true}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 4, -5]} intensity={1.5} />

        {/* Gallery Room Wireframe / Floor Guide */}
        <gridHelper args={[20, 20, "#e0b84a", "#333333"]} position={[0, 0, 0]} />

        {/* Display Pedestal if applicable */}
        {artifact.display_type === "pedestal" && (
          <mesh position={[pos[0], 0.35, pos[2]]} receiveShadow castShadow>
            <cylinderGeometry args={[0.6, 0.7, 0.7, 32]} />
            <meshStandardMaterial color="#e6e3dc" roughness={0.8} />
          </mesh>
        )}

        {/* Display Wall if applicable */}
        {artifact.display_type === "wall" && (
          <mesh position={[pos[0], pos[1], pos[2] - 0.2]} receiveShadow>
            <boxGeometry args={[2, 2, 0.1]} />
            <meshStandardMaterial color="#2d2d35" roughness={0.9} />
          </mesh>
        )}

        {/* Display Showcase if applicable */}
        {artifact.display_type === "showcase" && (
          <group position={[pos[0], 0, pos[2]]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.2, 0.8, 1.2]} />
              <meshStandardMaterial color="#1a1a1e" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[1.2, 1, 1.2]} />
              <meshPhysicalMaterial
                transparent
                opacity={0.3}
                roughness={0.1}
                transmission={0.9}
                ior={1.5}
                color="#ffffff"
              />
            </mesh>
          </group>
        )}

        <OrbitControls makeDefault />

        <TransformControls
          mode={transformMode}
          onObjectChange={(e) => {
            if (groupRef.current) {
              const p = groupRef.current.position
              const r = groupRef.current.rotation
              const s = groupRef.current.scale
              onTransformChange({
                position: [Number(p.x.toFixed(3)), Number(p.y.toFixed(3)), Number(p.z.toFixed(3))],
                rotation: [Number(r.x.toFixed(3)), Number(r.y.toFixed(3)), Number(r.z.toFixed(3))],
                scale: [Number(s.x.toFixed(3)), Number(s.y.toFixed(3)), Number(s.z.toFixed(3))],
              })
            }
          }}
        >
          <group ref={groupRef} position={pos} rotation={rot} scale={scl}>
            {artifact.model_url ? (
              <Suspense fallback={null}>
                <GlbModel
                  url={artifact.model_url}
                  artifact={artifact}
                  onModelAnalyzed={onModelAnalyzed}
                />
              </Suspense>
            ) : (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color="#e0b84a" wireframe />
              </mesh>
            )}
          </group>
        </TransformControls>
      </Canvas>
    </div>
  )
}
