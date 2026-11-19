"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Float, Sparkles } from "@react-three/drei"
import * as THREE from "three"

export function EventArenaScenario() {
  const laser1Ref = useRef<THREE.Group>(null)
  const laser2Ref = useRef<THREE.Group>(null)
  const laser3Ref = useRef<THREE.Group>(null)

  // Animated LED Screen Equalizer Bars
  const barsRef = useRef<THREE.InstancedMesh>(null)
  const numBars = 32
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Animate concert lasers and visualizer
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Sweeping Lasers
    if (laser1Ref.current) {
      laser1Ref.current.rotation.y = Math.sin(t * 2.2) * 0.8
      laser1Ref.current.rotation.z = Math.cos(t * 1.8) * 0.3
    }
    if (laser2Ref.current) {
      laser2Ref.current.rotation.y = -Math.sin(t * 1.9) * 0.8
      laser2Ref.current.rotation.z = -Math.cos(t * 1.5) * 0.3
    }
    if (laser3Ref.current) {
      laser3Ref.current.rotation.y = Math.cos(t * 2.5) * 0.6
    }

    // 3. LED Visualizer Bars Animation
    if (barsRef.current) {
      for (let i = 0; i < numBars; i++) {
        const x = (i - numBars / 2) * 0.8
        const height = Math.abs(Math.sin(t * 4 + i * 0.35) * Math.cos(t * 2 + i * 0.2)) * 5.5 + 0.6
        dummy.position.set(x, 7 + height / 2, -28.8)
        dummy.scale.set(0.6, height, 0.2)
        dummy.updateMatrix()
        barsRef.current.setMatrixAt(i, dummy.matrix)
      }
      barsRef.current.instanceMatrix.needsUpdate = true
    }
  })

  // Pre-calculate dancefloor grid tiles
  const floorTiles = useMemo(() => {
    const tiles: [number, number, string][] = []
    const colors = ["#06b6d4", "#a855f7", "#ec4899", "#3b82f6", "#10b981"]
    for (let x = -16; x <= 16; x += 4) {
      for (let z = 2; z <= 34; z += 4) {
        const color = colors[Math.floor(Math.random() * colors.length)]
        tiles.push([x, z, color])
      }
    }
    return tiles
  }, [])

  return (
    <group>
      {/* 1. Global Ambient & Arena Lighting */}
      <ambientLight intensity={0.7} color="#312e81" />
      <directionalLight position={[20, 40, 20]} intensity={1.2} color="#e0e7ff" />
      <directionalLight position={[-20, 30, -20]} intensity={0.8} color="#c084fc" />

      {/* 2. Spotlights & Glow Lights focused on Stage & Crowd */}
      <pointLight position={[0, 12, -15]} intensity={6} color="#06b6d4" distance={45} />
      <pointLight position={[-15, 10, -5]} intensity={4} color="#a855f7" distance={35} />
      <pointLight position={[15, 10, -5]} intensity={4} color="#ec4899" distance={35} />
      <pointLight position={[0, 8, 15]} intensity={3} color="#38bdf8" distance={40} />

      {/* 3. Ample Floor Ground & Arena Plazas (100x100m) */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#6b7280" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Grid Floor Overlay with subtle lines */}
      <gridHelper
        args={[120, 60, "#06b6d4", "#475569"]}
        position={[0, 0.01, 0]}
      />

      {/* 4. Interactive Dance Floor Grid Tiles with Glow */}
      {floorTiles.map(([x, z, color], idx) => (
        <group key={idx} position={[x, 0.03, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.2}
              metalness={0.8}
              emissive={color}
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.6, 1.7, 32]} />
            <meshBasicMaterial color={color} opacity={0.6} transparent />
          </mesh>
        </group>
      ))}

      {/* 5. MEGA STAGE STRUCTURE */}
      {/* Main Stage Base Deck */}
      <group position={[0, 0, -22]}>
        {/* Stage Main Platform */}
        <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
          <boxGeometry args={[38, 3.6, 16]} />
          <meshStandardMaterial
            color="#090d16"
            roughness={0.2}
            metalness={0.8}
            emissive="#06b6d4"
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Stage Front Neon Edge */}
        <mesh position={[0, 3.62, 8]}>
          <boxGeometry args={[38, 0.12, 0.3]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={3} />
        </mesh>

        {/* Stage Ramps / Steps */}
        <mesh position={[-20, 1.0, 4]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[6, 0.4, 4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[20, 1.0, 4]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[6, 0.4, 4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* DJ Booth / Sound Deck */}
        <group position={[0, 3.6, 0]}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <boxGeometry args={[5, 1.2, 2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* DJ Table Top Neon Trim */}
          <mesh position={[0, 1.22, 0]}>
            <boxGeometry args={[5.1, 0.08, 2.1]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={3} />
          </mesh>
          {/* DJ Holographic Decks / Controllers */}
          <mesh position={[-1.2, 1.3, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.06, 24]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
          </mesh>
          <mesh position={[1.2, 1.3, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.06, 24]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
          </mesh>
          {/* DJ Laptop / Screen */}
          <mesh position={[0, 1.45, -0.4]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[1, 0.6, 0.05]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* GIANT BACK LED SCREEN */}
        <group position={[0, 8.5, -7.5]}>
          {/* LED Screen Frame */}
          <mesh castShadow position={[0, 0, -0.2]}>
            <boxGeometry args={[36, 12, 0.6]} />
            <meshStandardMaterial color="#030712" roughness={0.7} />
          </mesh>

          {/* LED Glowing Background */}
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[35, 11]} />
            <meshBasicMaterial color="#050814" />
          </mesh>

          {/* Holographic 3D Floating Title */}
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <Text
              position={[0, 2.8, 0.4]}
              fontSize={1.8}
              color="#00f0ff"
              anchorX="center"
              anchorY="middle"
            >
              JORGE AOR
            </Text>
            <Text
              position={[0, 1.1, 0.4]}
              fontSize={0.8}
              color="#d946ef"
              anchorX="center"
              anchorY="middle"
            >
              PORTFOLIO EXPERIENCE
            </Text>
          </Float>

          {/* Instanced Equalizer Bars */}
          <instancedMesh ref={barsRef} args={[undefined, undefined, numBars]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#a855f7"
              emissiveIntensity={2.5}
              roughness={0.2}
            />
          </instancedMesh>
        </group>

        {/* Overhead Truss Rigging System */}
        <group position={[0, 15, 0]}>
          {/* Main Top Horizontal Truss Beam */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[42, 0.8, 18]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
          {/* Vertical Support Pillars */}
          <mesh position={[-19, -7.5, -8]}>
            <boxGeometry args={[1, 15, 1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
          <mesh position={[19, -7.5, -8]}>
            <boxGeometry args={[1, 15, 1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
          <mesh position={[-19, -7.5, 8]}>
            <boxGeometry args={[1, 15, 1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
          <mesh position={[19, -7.5, 8]}>
            <boxGeometry args={[1, 15, 1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
        </group>

        {/* Giant Speaker Towers / Subwoofers (Left & Right) */}
        {[-16, 16].map((xPos, idx) => (
          <group key={idx} position={[xPos, 7.5, 0]}>
            {/* Hanging Subwoofer Line Array */}
            <mesh castShadow>
              <boxGeometry args={[2.5, 9, 2.5]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Speaker Cones Glow */}
            {[-3, -1, 1, 3].map((yOff, i) => (
              <mesh key={i} position={[0, yOff, 1.28]}>
                <circleGeometry args={[0.7, 16]} />
                <meshStandardMaterial
                  color="#1e293b"
                  emissive="#06b6d4"
                  emissiveIntensity={1.5}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Lasers sweeping from stage top */}
        <group ref={laser1Ref} position={[-8, 14, -6]}>
          <mesh position={[0, -10, 15]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.25, 35, 8]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.65} />
          </mesh>
        </group>
        <group ref={laser2Ref} position={[8, 14, -6]}>
          <mesh position={[0, -10, 15]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.25, 35, 8]} />
            <meshBasicMaterial color="#ff00ff" transparent opacity={0.65} />
          </mesh>
        </group>
        <group ref={laser3Ref} position={[0, 14, -6]}>
          <mesh position={[0, -10, 15]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.3, 35, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      </group>

      {/* 6. VIP LOUNGES & SIDE AMENITIES (Left & Right of Arena) */}
      {/* Left VIP Lounge */}
      <group position={[-28, 0, 12]}>
        {/* Elevated VIP Platform */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[14, 1.2, 22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Platform Neon Trim */}
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[14.1, 0.08, 22.1]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} />
        </mesh>
        {/* VIP Couches */}
        <mesh castShadow position={[0, 1.6, -6]}>
          <boxGeometry args={[8, 0.8, 2.5]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 1.6, 6]}>
          <boxGeometry args={[8, 0.8, 2.5]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
        </mesh>
        {/* VIP Glowing Table */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.6, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} />
        </mesh>
        <Float speed={1.5} floatIntensity={0.5}>
          <Text position={[0, 3.5, 0]} fontSize={0.7} color="#fbbf24" anchorX="center">
            VIP LOUNGE
          </Text>
        </Float>
      </group>

      {/* Right Lounge / Cyber Bar */}
      <group position={[28, 0, 12]}>
        {/* Elevated Platform */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[14, 1.2, 22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Platform Neon Trim */}
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[14.1, 0.08, 22.1]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} />
        </mesh>
        {/* Bar Counter */}
        <mesh castShadow position={[0, 1.8, -5]}>
          <boxGeometry args={[10, 1.4, 2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Bar Bottle Lights */}
        {[-3, -1, 1, 3].map((xOff, i) => (
          <mesh key={i} position={[xOff, 2.7, -5]}>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 12]} />
            <meshStandardMaterial
              color="#34d399"
              emissive="#34d399"
              emissiveIntensity={3}
            />
          </mesh>
        ))}
        <Float speed={1.5} floatIntensity={0.5}>
          <Text position={[0, 3.5, 0]} fontSize={0.7} color="#34d399" anchorX="center">
            CYBER BAR & DRINKS
          </Text>
        </Float>
      </group>

      {/* 7. ARENA BOUNDARY TOWERS & NEON PILLARS */}
      {[-42, 42].map((xPill, i) => (
        <group key={i} position={[xPill, 0, 0]}>
          {[-30, -10, 10, 30].map((zPill, j) => (
            <group key={j} position={[0, 8, zPill]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.6, 0.9, 16, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
              </mesh>
              {/* Glowing vertical rings */}
              {[-5, 0, 5].map((yRing, k) => (
                <mesh key={k} position={[0, yRing, 0]}>
                  <torusGeometry args={[0.95, 0.08, 12, 24]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={2.5}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* 8. Atmospheric Floating Sparkles & Confetti Particles */}
      <Sparkles
        count={250}
        scale={[70, 25, 70]}
        position={[0, 10, 0]}
        size={3.5}
        speed={0.8}
        color="#a855f7"
      />
      <Sparkles
        count={200}
        scale={[70, 20, 70]}
        position={[0, 8, 0]}
        size={3}
        speed={0.5}
        color="#06b6d4"
      />
    </group>
  )
}
