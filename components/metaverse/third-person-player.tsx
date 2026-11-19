"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { AvatarConfig, SceneCollider } from "./types"

interface PlayerProps {
  avatarConfig: AvatarConfig
  spawnPosition?: [number, number, number]
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number }
  colliders?: SceneCollider[]
  onPositionChange?: (x: number, y: number, z: number) => void
  isLocked?: boolean
  initialCameraYaw?: number
}

type KeyState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  sprint: boolean
  jump: boolean
  dance: boolean
}

export function ThirdPersonPlayer({
  avatarConfig,
  spawnPosition = [0, 0, 15],
  bounds = { minX: -45, maxX: 45, minZ: -45, maxZ: 45 },
  colliders = [],
  onPositionChange,
  initialCameraYaw = 0,
}: PlayerProps) {
  const { camera, gl } = useThree()

  // Character physical state
  const playerPos = useRef(new THREE.Vector3(...spawnPosition))
  const playerVelocityY = useRef(0)
  const isGrounded = useRef(true)
  const initialPlayerYaw = Math.atan2(-Math.sin(initialCameraYaw), -Math.cos(initialCameraYaw))
  const playerYaw = useRef(initialPlayerYaw) // Orientation of character
  const targetYaw = useRef(initialPlayerYaw)

  // Camera spherical coordinates (Orbit around player)
  const camDistance = useRef(5.5)
  const targetCamDistance = useRef(5.5)
  const camYaw = useRef(initialCameraYaw)
  const camPitch = useRef(0.25) // Radians up/down
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })

  // Avatar Limb Refs for Procedural Animations
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const torsoRef = useRef<THREE.Group>(null)
  const rootGroupRef = useRef<THREE.Group>(null)

  // Movement inputs
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    dance: false,
  })

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is typing in an input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true
          break
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true
          break
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true
          break
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true
          break
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint = true
          break
        case "Space":
          keys.current.jump = true
          break
        case "KeyB":
          keys.current.dance = !keys.current.dance
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false
          break
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false
          break
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false
          break
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false
          break
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint = false
          break
        case "Space":
          keys.current.jump = false
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Mouse Orbit Drag Controls & Zoom
  useEffect(() => {
    const dom = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true
        previousMousePosition.current = { x: e.clientX, y: e.clientY }
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y
      previousMousePosition.current = { x: e.clientX, y: e.clientY }

      // Adjust camera yaw and pitch
      camYaw.current -= deltaX * 0.006
      camPitch.current = Math.max(
        0.05,
        Math.min(Math.PI / 2.2, camPitch.current + deltaY * 0.005)
      )
    }

    const onMouseUp = () => {
      isDragging.current = false
    }

    const onWheel = (e: WheelEvent) => {
      targetCamDistance.current = Math.max(
        2.5,
        Math.min(12, targetCamDistance.current + e.deltaY * 0.005)
      )
    }

    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    dom.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    dom.addEventListener("wheel", onWheel, { passive: true })
    dom.addEventListener("contextmenu", onContextMenu)

    return () => {
      dom.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      dom.removeEventListener("wheel", onWheel)
      dom.removeEventListener("contextmenu", onContextMenu)
    }
  }, [gl])

  // Reset spawn when prop changes
  useEffect(() => {
    playerPos.current.set(...spawnPosition)
    playerVelocityY.current = 0
  }, [spawnPosition])

  // Helpers
  const forwardDir = useMemo(() => new THREE.Vector3(), [])
  const sideDir = useMemo(() => new THREE.Vector3(), [])
  const moveDir = useMemo(() => new THREE.Vector3(), [])
  const desiredCamPos = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  // Animation walk cycle accumulator
  const animTime = useRef(0)

  useFrame((state, delta) => {
    const k = keys.current
    const isMoving = k.forward || k.backward || k.left || k.right
    const speed = k.sprint ? 9.5 : 5.0

    // 1. Jumping & Gravity Physics
    const gravity = 22
    const jumpStrength = 10.8
    const playerRadius = 0.42
    const footRadius = 0.28
    const stepTolerance = 0.3

    if (k.jump && isGrounded.current) {
      playerVelocityY.current = jumpStrength
      isGrounded.current = false
    }

    playerVelocityY.current -= gravity * delta
    playerPos.current.y += playerVelocityY.current * delta

    // 2. Calculate movement relative to Camera Yaw
    forwardDir.set(-Math.sin(camYaw.current), 0, -Math.cos(camYaw.current)).normalize()
    sideDir.set(Math.cos(camYaw.current), 0, -Math.sin(camYaw.current)).normalize()

    moveDir.set(0, 0, 0)
    if (k.forward) moveDir.add(forwardDir)
    if (k.backward) moveDir.sub(forwardDir)
    if (k.right) moveDir.add(sideDir)
    if (k.left) moveDir.sub(sideDir)

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize()
      // Move player position
      playerPos.current.x += moveDir.x * speed * delta
      playerPos.current.z += moveDir.z * speed * delta

      // Target character rotation angle in radians
      targetYaw.current = Math.atan2(moveDir.x, moveDir.z)
    }

    // 3. Resolve Horizontal Obstacle Collisions (Walls, Stage sides, Benches, Planters, Posts)
    for (const collider of colliders) {
      const blocksHorizontally = collider.walkable
        ? playerPos.current.y < collider.topY - stepTolerance
        : playerPos.current.y < collider.topY

      if (!blocksHorizontally) continue

      if (collider.type === "circle") {
        const dx = playerPos.current.x - collider.x
        const dz = playerPos.current.z - collider.z
        const distSq = dx * dx + dz * dz
        const minDist = collider.radius + playerRadius
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq)
          if (dist > 1e-5) {
            const push = (minDist - dist) / dist
            playerPos.current.x += dx * push
            playerPos.current.z += dz * push
          } else {
            playerPos.current.z += minDist
          }
        }
      } else {
        const rot = collider.rotationY ?? 0
        const cos = Math.cos(rot)
        const sin = Math.sin(rot)
        const dx = playerPos.current.x - collider.x
        const dz = playerPos.current.z - collider.z
        const lx = dx * cos - dz * sin
        const lz = dx * sin + dz * cos

        const hx = collider.halfWidth
        const hz = collider.halfDepth
        const clx = Math.max(-hx, Math.min(hx, lx))
        const clz = Math.max(-hz, Math.min(hz, lz))
        const diffX = lx - clx
        const diffZ = lz - clz
        const distSq = diffX * diffX + diffZ * diffZ

        if (distSq < playerRadius * playerRadius) {
          let nlx = lx
          let nlz = lz
          if (distSq > 1e-6) {
            const dist = Math.sqrt(distSq)
            const push = playerRadius - dist
            nlx = lx + (diffX / dist) * push
            nlz = lz + (diffZ / dist) * push
          } else {
            const overlapX = hx + playerRadius - Math.abs(lx)
            const overlapZ = hz + playerRadius - Math.abs(lz)
            if (overlapX < overlapZ) {
              nlx = lx >= 0 ? hx + playerRadius : -(hx + playerRadius)
            } else {
              nlz = lz >= 0 ? hz + playerRadius : -(hz + playerRadius)
            }
          }
          playerPos.current.x = collider.x + nlx * cos + nlz * sin
          playerPos.current.z = collider.z - nlx * sin + nlz * cos
        }
      }
    }

    // 4. Compute Walkable Ground Surface Height (Stage, Benches, Floor)
    let groundY = 0
    for (const collider of colliders) {
      if (!collider.walkable) continue

      let isOver = false
      if (collider.type === "circle") {
        const dx = playerPos.current.x - collider.x
        const dz = playerPos.current.z - collider.z
        const r = collider.radius + footRadius
        isOver = dx * dx + dz * dz <= r * r
      } else {
        const rot = collider.rotationY ?? 0
        const cos = Math.cos(rot)
        const sin = Math.sin(rot)
        const dx = playerPos.current.x - collider.x
        const dz = playerPos.current.z - collider.z
        const lx = dx * cos - dz * sin
        const lz = dx * sin + dz * cos
        isOver =
          Math.abs(lx) <= collider.halfWidth + footRadius &&
          Math.abs(lz) <= collider.halfDepth + footRadius
      }

      if (isOver && playerPos.current.y >= collider.topY - stepTolerance) {
        groundY = Math.max(groundY, collider.topY)
      }
    }

    if (playerPos.current.y <= groundY && playerVelocityY.current <= 0) {
      playerPos.current.y = groundY
      playerVelocityY.current = 0
      isGrounded.current = true
    } else if (isGrounded.current && playerPos.current.y > groundY) {
      if (playerPos.current.y - groundY <= 0.18) {
        playerPos.current.y = groundY
        playerVelocityY.current = 0
      } else {
        isGrounded.current = false
      }
    }

    // Bound limits
    playerPos.current.x = Math.max(bounds.minX, Math.min(bounds.maxX, playerPos.current.x))
    playerPos.current.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, playerPos.current.z))

    // Smooth character rotation toward moving direction
    let diff = targetYaw.current - playerYaw.current
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2
    playerYaw.current += diff * Math.min(1, delta * 14)

    // Update root group
    if (rootGroupRef.current) {
      rootGroupRef.current.position.copy(playerPos.current)
      rootGroupRef.current.rotation.y = playerYaw.current
    }

    // 3. Procedural Avatar Animations (Limbs / Head / Torso)
    const cycleSpeed = k.sprint ? 14 : 9
    if (isMoving && isGrounded.current) {
      animTime.current += delta * cycleSpeed
      const swing = Math.sin(animTime.current)
      const armSwing = Math.cos(animTime.current)
      const bounce = Math.abs(Math.sin(animTime.current * 2)) * 0.08

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing * 0.75
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing * 0.75
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing * 0.65
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing * 0.65
      if (torsoRef.current) {
        torsoRef.current.position.y = 1.05 + bounce
        torsoRef.current.rotation.z = -swing * 0.04
      }
    } else if (!isGrounded.current) {
      // Jump pose
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.4
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.3
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.1
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.1
      if (torsoRef.current) torsoRef.current.position.y = 1.15
    } else if (k.dance) {
      // Emote / Dance pose
      animTime.current += delta * 6
      const danceStep = Math.sin(animTime.current)
      const danceArm = Math.cos(animTime.current)
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -2.0 + Math.sin(animTime.current * 2) * 0.5
        leftArmRef.current.rotation.z = -0.6 + danceStep * 0.3
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -2.0 + Math.cos(animTime.current * 2) * 0.5
        rightArmRef.current.rotation.z = 0.6 - danceStep * 0.3
      }
      if (leftLegRef.current) leftLegRef.current.rotation.z = -danceStep * 0.2
      if (rightLegRef.current) rightLegRef.current.rotation.z = danceStep * 0.2
      if (torsoRef.current) {
        torsoRef.current.position.y = 1.05 + Math.abs(danceStep) * 0.1
        torsoRef.current.rotation.y = danceStep * 0.3
      }
    } else {
      // Idle breathing
      animTime.current += delta * 2.5
      const breath = Math.sin(animTime.current) * 0.02
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = breath * 0.5
        leftArmRef.current.rotation.z = -0.1
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = breath * 0.5
        rightArmRef.current.rotation.z = 0.1
      }
      if (torsoRef.current) {
        torsoRef.current.position.y = 1.05 + breath
        torsoRef.current.rotation.z = 0
        torsoRef.current.rotation.y = 0
      }
    }

    // 4. Smooth Third-Person Camera Follow
    camDistance.current = THREE.MathUtils.lerp(
      camDistance.current,
      targetCamDistance.current,
      delta * 10
    )

    // Calculate target camera position behind player
    const camTargetX = playerPos.current.x
    const camTargetY = playerPos.current.y + 1.6 // Eye level
    const camTargetZ = playerPos.current.z

    const offsetX = Math.sin(camYaw.current) * Math.cos(camPitch.current) * camDistance.current
    const offsetY = Math.sin(camPitch.current) * camDistance.current
    const offsetZ = Math.cos(camYaw.current) * Math.cos(camPitch.current) * camDistance.current

    desiredCamPos.set(camTargetX + offsetX, camTargetY + offsetY, camTargetZ + offsetZ)

    // Damping camera position for smooth, premium feel
    camera.position.lerp(desiredCamPos, Math.min(1, delta * 15))

    lookTarget.set(camTargetX, camTargetY + 0.2, camTargetZ)
    camera.lookAt(lookTarget)

    // Notify parent for HUD/Minimap
    if (onPositionChange) {
      onPositionChange(playerPos.current.x, playerPos.current.y, playerPos.current.z)
    }
  })

  // Colors
  const primaryColor = avatarConfig.color || "#c88a55"
  const secondaryColor = avatarConfig.secondaryColor || "#161211"

  return (
    <group ref={rootGroupRef} position={spawnPosition}>
      {/* Torso & Upper Body */}
      <group ref={torsoRef} position={[0, 1.05, 0]}>
        {/* Chest Plate */}
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[0.44, 0.48, 0.26]} />
          <meshStandardMaterial
            color={secondaryColor}
            roughness={0.22}
            metalness={0.82}
          />
        </mesh>

        {/* Warm Amber Core Light */}
        <mesh position={[0.1, 0.34, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
          <meshBasicMaterial color="#ffad54" />
        </mesh>

        {/* Waist / Belt */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.38, 0.14, 0.23]} />
          <meshStandardMaterial color="#120e0d" roughness={0.4} metalness={0.85} />
        </mesh>

        {/* Head & Visor */}
        <group ref={headRef} position={[0, 0.58, 0]}>
          {/* Head Shape */}
          <mesh castShadow position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.19, 20, 20]} />
            <meshStandardMaterial color="#0b0909" roughness={0.16} metalness={0.92} />
          </mesh>
          {/* Visor */}
          <mesh position={[0, 0.08, 0.13]}>
            <boxGeometry args={[0.25, 0.08, 0.1]} />
            <meshBasicMaterial color="#ffba6b" />
          </mesh>
          {/* Side Ear Lights */}
          <mesh position={[-0.19, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
            <meshBasicMaterial color="#ffeed6" />
          </mesh>
          <mesh position={[0.19, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
            <meshBasicMaterial color="#ffeed6" />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.3, 0.35, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.22} />
          </mesh>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.055, 0.28, 6, 12]} />
            <meshStandardMaterial color="#1a1514" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#d6c5b8" roughness={0.3} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.3, 0.35, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.22} />
          </mesh>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.055, 0.28, 6, 12]} />
            <meshStandardMaterial color="#1a1514" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#d6c5b8" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.13, 0.9, 0]}>
        <mesh castShadow position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.07, 0.5, 6, 12]} />
          <meshStandardMaterial color="#141010" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh castShadow position={[0, -0.72, 0.04]}>
          <boxGeometry args={[0.11, 0.09, 0.22]} />
          <meshStandardMaterial color="#2b2320" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.13, 0.9, 0]}>
        <mesh castShadow position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.07, 0.5, 6, 12]} />
          <meshStandardMaterial color="#141010" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh castShadow position={[0, -0.72, 0.04]}>
          <boxGeometry args={[0.11, 0.09, 0.22]} />
          <meshStandardMaterial color="#2b2320" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Avatar Ground Shadow + Signature Golden Halo Ring */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" opacity={0.45} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 0.88, 36]} />
        <meshBasicMaterial color="#ffb057" />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.98, 36]} />
        <meshBasicMaterial color="#d87a2e" opacity={0.25} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}
