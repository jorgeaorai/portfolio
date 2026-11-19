"use client"

import { useEffect, useMemo, useRef } from "react"
import type { ComponentRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import { Vector3 } from "three"
import { ARTWORKS } from "./artworks"
import { MuseumArtifact } from "@/lib/types/artifact"

const SPEED = 4.2
const PLAYER_RADIUS = 0.4
const PEDESTAL_RADIUS = 0.75
const BOUND_X = 7.3
const BOUND_Z = 21.3
const EYE_HEIGHT = 1.6
const PROXIMITY = 3.6

type Keys = { forward: boolean; backward: boolean; left: boolean; right: boolean }

function useKeyboard() {
  const keys = useRef<Keys>({ forward: false, backward: false, left: false, right: false })

  useEffect(() => {
    const set = (code: string, value: boolean) => {
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = value
          break
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = value
          break
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = value
          break
        case "KeyD":
        case "ArrowRight":
          keys.current.right = value
          break
      }
    }
    const down = (e: KeyboardEvent) => set(e.code, true)
    const up = (e: KeyboardEvent) => set(e.code, false)
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  return keys
}

export function Player({
  dynamicArtifacts = [],
  onActiveChange,
  onLockChange,
}: {
  dynamicArtifacts?: MuseumArtifact[]
  onActiveChange: (id: string | null) => void
  onLockChange: (locked: boolean) => void
}) {
  const controlsRef = useRef<ComponentRef<typeof PointerLockControls>>(null)
  const { camera } = useThree()
  const keys = useKeyboard()

  const forwardVec = useMemo(() => new Vector3(), [])
  const rightVec = useMemo(() => new Vector3(), [])
  const move = useMemo(() => new Vector3(), [])
  const lastActive = useRef<string | null>(null)

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 18)
  }, [camera])

  useFrame((_, delta) => {
    const k = keys.current

    // Horizontal direction based on camera orientation
    camera.getWorldDirection(forwardVec)
    forwardVec.y = 0
    forwardVec.normalize()
    rightVec.crossVectors(forwardVec, camera.up).normalize()

    move.set(0, 0, 0)
    if (k.forward) move.add(forwardVec)
    if (k.backward) move.sub(forwardVec)
    if (k.right) move.add(rightVec)
    if (k.left) move.sub(rightVec)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(SPEED * delta)
      camera.position.x += move.x
      camera.position.z += move.z
    }

    // Collision detection with static artwork pedestals
    for (const art of ARTWORKS) {
      const dx = camera.position.x - art.position[0]
      const dz = camera.position.z - art.position[2]
      const dist = Math.hypot(dx, dz)
      const minDist = PLAYER_RADIUS + PEDESTAL_RADIUS
      if (dist < minDist && dist > 0.0001) {
        const push = (minDist - dist) / dist
        camera.position.x += dx * push
        camera.position.z += dz * push
      }
    }

    // Collision detection with dynamic uploaded artifacts
    for (const art of dynamicArtifacts) {
      const dx = camera.position.x - art.position_x
      const dz = camera.position.z - art.position_z
      const dist = Math.hypot(dx, dz)
      const minDist = PLAYER_RADIUS + PEDESTAL_RADIUS
      if (dist < minDist && dist > 0.0001) {
        const push = (minDist - dist) / dist
        camera.position.x += dx * push
        camera.position.z += dz * push
      }
    }

    // Room boundaries
    camera.position.x = Math.max(-BOUND_X, Math.min(BOUND_X, camera.position.x))
    camera.position.z = Math.max(-BOUND_Z, Math.min(BOUND_Z, camera.position.z))
    camera.position.y = EYE_HEIGHT

    // Nearest item detection
    let nearestId: string | null = null
    let nearestDist = PROXIMITY

    for (const art of ARTWORKS) {
      const dx = camera.position.x - art.position[0]
      const dz = camera.position.z - art.position[2]
      const dist = Math.hypot(dx, dz)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestId = art.id
      }
    }

    for (const art of dynamicArtifacts) {
      const dx = camera.position.x - art.position_x
      const dz = camera.position.z - art.position_z
      const dist = Math.hypot(dx, dz)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestId = art.id
      }
    }

    if (nearestId !== lastActive.current) {
      lastActive.current = nearestId
      onActiveChange(nearestId)
    }
  })

  return (
    <PointerLockControls
      ref={controlsRef}
      selector="#enter-museum"
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  )
}
