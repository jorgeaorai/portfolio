"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type { Group } from "three"
import type { Artwork } from "./artworks"

function ShapeGeometry({ shape }: { shape: Artwork["shape"] }) {
  switch (shape) {
    case "torusknot":
      return <torusKnotGeometry args={[0.5, 0.16, 160, 24]} />
    case "icosahedron":
      return <icosahedronGeometry args={[0.7, 0]} />
    case "torus":
      return <torusGeometry args={[0.55, 0.18, 24, 64]} />
    case "cone":
      return <coneGeometry args={[0.55, 1.2, 48]} />
    case "octahedron":
      return <octahedronGeometry args={[0.75, 0]} />
    case "dodecahedron":
      return <dodecahedronGeometry args={[0.7, 0]} />
    case "capsule":
      return <capsuleGeometry args={[0.35, 0.7, 12, 24]} />
    default:
      return <boxGeometry args={[0.8, 0.8, 0.8]} />
  }
}

// Busto clássico em mármore, esculpido com primitivas (estilo renascentista).
function MarbleBust({ artwork, active }: { artwork: Artwork; active: boolean }) {
  const marble = (
    <meshStandardMaterial
      color={artwork.color}
      emissive={artwork.emissive}
      emissiveIntensity={active ? 0.5 : 0.22}
      metalness={0}
      roughness={artwork.roughness}
    />
  )

  return (
    <group position={[0, 0.06, 0]} castShadow>
      {/* Plinto sob o busto */}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.18, 32]} />
        {marble}
      </mesh>
      {/* Peito / tórax que se afunila para cima */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.42, 0.55, 32]} />
        {marble}
      </mesh>
      {/* Ombros arredondados */}
      <mesh position={[0, 0.6, 0]} scale={[0.62, 0.34, 0.36]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        {marble}
      </mesh>
      {/* Pescoço */}
      <mesh position={[0, 0.82, 0.01]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.22, 24]} />
        {marble}
      </mesh>
      {/* Cabeça (crânio ligeiramente alongado) */}
      <mesh position={[0, 1.04, 0.01]} scale={[0.9, 1.12, 1]} castShadow>
        <sphereGeometry args={[0.19, 32, 32]} />
        {marble}
      </mesh>
      {/* Cabelo / topo do crânio */}
      <mesh position={[0, 1.13, -0.03]} scale={[0.95, 0.8, 1.02]} castShadow>
        <sphereGeometry args={[0.185, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        {marble}
      </mesh>
      {/* Nariz */}
      <mesh position={[0, 1.02, 0.19]} rotation={[Math.PI / 2.1, 0, 0]} castShadow>
        <coneGeometry args={[0.035, 0.13, 16]} />
        {marble}
      </mesh>
    </group>
  )
}

export function Sculpture({ artwork, active }: { artwork: Artwork; active: boolean }) {
  const spinRef = useRef<Group>(null)
  const isBust = artwork.shape === "bust"

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * artwork.rotationSpeed
    }
  })

  const [x] = artwork.position

  return (
    <group position={artwork.position}>
      {/* Pedestal */}
      <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 1.4, 48]} />
        <meshStandardMaterial color="#e6e3dc" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.04, 48]} />
        <meshStandardMaterial color="#1b1b1e" roughness={0.6} />
      </mesh>

      {/* Escultura */}
      {isBust ? (
        <group ref={spinRef}>
          <MarbleBust artwork={artwork} active={active} />
        </group>
      ) : (
        <group ref={spinRef} position={[0, 0.75, 0]} scale={artwork.scale}>
          <mesh castShadow>
            <ShapeGeometry shape={artwork.shape} />
            <meshStandardMaterial
              color={artwork.color}
              emissive={artwork.emissive}
              emissiveIntensity={active ? 0.9 : 0.35}
              metalness={artwork.metalness}
              roughness={artwork.roughness}
            />
          </mesh>
        </group>
      )}

      {/* Luz de destaque sobre a obra */}
      <pointLight
        position={[0, 2.6, 0]}
        intensity={active ? 6 : 2.5}
        distance={5}
        color="#fff4e0"
      />

      {/* Placa de identificação na base do pedestal, virada para o corredor */}
      <Html
        position={[x < 0 ? 0.62 : -0.62, -0.55, 0.45]}
        center
        distanceFactor={9}
        occlude
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            width: 120,
            textAlign: "center",
            fontFamily: "var(--font-geist-sans), sans-serif",
            background: active ? "#c69a2e" : "#f4f2ec",
            color: "#1b1b1e",
            border: "1px solid #1b1b1e",
            borderRadius: 3,
            padding: "5px 7px",
            transition: "background 0.3s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.2 }}>
            {artwork.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 8, opacity: 0.7, marginTop: 2 }}>
            {artwork.artist}, {artwork.year}
          </div>
        </div>
      </Html>

      {/* Realce sutil no chão quando ativo */}
      {active && (
        <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.95, 48]} />
          <meshBasicMaterial color="#e0b84a" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}
