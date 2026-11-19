"use client"

import React, { Suspense, useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Html } from "@react-three/drei"
import * as THREE from "three"
import { MuseumArtifact } from "@/lib/types/artifact"

interface DynamicArtifactProps {
  artifact: MuseumArtifact
  active: boolean
  isProximity: boolean
}

function GlbModel({
  url,
  shadowsEnabled,
}: {
  url: string
  shadowsEnabled: boolean
}) {
  const { scene } = useGLTF(url)
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = shadowsEnabled
        child.receiveShadow = shadowsEnabled
      }
    })
  }, [clonedScene, shadowsEnabled])

  return <primitive object={clonedScene} />
}

function DisplayBase({ displayType }: { displayType: MuseumArtifact["display_type"] }) {
  if (displayType === "wall") {
    return (
      <mesh position={[0, 0, -0.1]} receiveShadow>
        <boxGeometry args={[1.6, 1.6, 0.08]} />
        <meshStandardMaterial color="#2d2d35" roughness={0.9} />
      </mesh>
    )
  }

  if (displayType === "showcase") {
    return (
      <group>
        <mesh position={[0, -0.8, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
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
    )
  }

  // Default Pedestal
  return (
    <group>
      <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 1.4, 48]} />
        <meshStandardMaterial color="#e6e3dc" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.04, 48]} />
        <meshStandardMaterial color="#1b1b1e" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function DynamicArtifact({ artifact, active, isProximity }: DynamicArtifactProps) {
  const spinRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    // Subtle rotation effect for active or non-proximity items
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.15
    }
  })

  const pos: [number, number, number] = [artifact.position_x, artifact.position_y, artifact.position_z]
  const rot: [number, number, number] = [artifact.rotation_x, artifact.rotation_y, artifact.rotation_z]
  const scl: [number, number, number] = [artifact.scale_x, artifact.scale_y, artifact.scale_z]

  return (
    <group position={pos}>
      {/* Pedestal, Wall, or Showcase base */}
      <DisplayBase displayType={artifact.display_type} />

      {/* 3D Model loaded dynamically */}
      <group ref={spinRef} rotation={rot} scale={scl}>
        {artifact.model_url ? (
          <Suspense fallback={
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#c69a2e" wireframe />
            </mesh>
          }>
            <GlbModel url={artifact.model_url} shadowsEnabled={artifact.shadows_enabled} />
          </Suspense>
        ) : (
          <mesh castShadow>
            <torusKnotGeometry args={[0.4, 0.12, 128, 16]} />
            <meshStandardMaterial color="#c69a2e" metalness={0.8} roughness={0.2} />
          </mesh>
        )}
      </group>

      {/* Spot/Point Light */}
      <pointLight
        position={[0, 2.5, 0]}
        intensity={active || isProximity ? (artifact.light_intensity || 4) + 2 : artifact.light_intensity || 4}
        distance={6}
        color="#fff4e0"
      />

      {/* Identification Plate */}
      <Html
        position={[pos[0] < 0 ? 0.62 : -0.62, -0.55, 0.45]}
        center
        distanceFactor={9}
        occlude
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            width: 130,
            textAlign: "center",
            fontFamily: "var(--font-geist-sans), sans-serif",
            background: isProximity ? "#c69a2e" : "#f4f2ec",
            color: "#1b1b1e",
            border: "1px solid #1b1b1e",
            borderRadius: 4,
            padding: "5px 7px",
            transition: "background 0.3s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1.2 }}>
            {artifact.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 8, opacity: 0.8, marginTop: 2 }}>
            {artifact.author || "Unknown"}, {artifact.historical_period || "N/A"}
          </div>
        </div>
      </Html>

      {/* Proximity floor highlight ring */}
      {isProximity && (
        <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.95, 48]} />
          <meshBasicMaterial color="#e0b84a" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
