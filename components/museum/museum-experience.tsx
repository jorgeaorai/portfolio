"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Gallery } from "./gallery"
import { Player } from "./player"
import { ARTWORKS } from "./artworks"
import { MuseumArtifact } from "@/lib/types/artifact"
import { InspectionModal } from "./inspection-modal"
import { MousePointerClick, Keyboard, Info, Eye, ShieldCheck } from "lucide-react"

export default function MuseumExperience() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [dynamicArtifacts, setDynamicArtifacts] = useState<MuseumArtifact[]>([])
  const [inspectingArtifact, setInspectingArtifact] = useState<MuseumArtifact | null>(null)

  // Fetch published dynamic 3D artifacts from server
  useEffect(() => {
    fetch("/api/artifacts?status=published")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDynamicArtifacts(data)
        }
      })
      .catch((err) => console.error("Error fetching dynamic artifacts:", err))
  }, [])

  // Find active artwork from either static list or dynamic published list
  const activeArt = useMemo(() => {
    if (!activeId) return null
    const staticItem = ARTWORKS.find((a) => a.id === activeId)
    if (staticItem) {
      return {
        id: staticItem.id,
        title: staticItem.title,
        artist: staticItem.artist,
        year: staticItem.year,
        medium: staticItem.medium,
        description: staticItem.description,
      }
    }
    const dynamicItem = dynamicArtifacts.find((a) => a.id === activeId)
    if (dynamicItem) {
      return {
        id: dynamicItem.id,
        title: dynamicItem.title,
        artist: dynamicItem.author || "Unknown",
        year: dynamicItem.historical_period || "N/A",
        medium: dynamicItem.material || "N/A",
        description: dynamicItem.description,
        isDynamic: true,
        fullData: dynamicItem,
      }
    }
    return null
  }, [activeId, dynamicArtifacts])

  // Keydown listener for 'E' key to open 3D inspection modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E") && activeArt && locked) {
        if (activeArt.isDynamic && activeArt.fullData) {
          setInspectingArtifact(activeArt.fullData)
          document.exitPointerLock?.()
        } else {
          // Convert static artwork to MuseumArtifact for inspection modal
          const staticFull: MuseumArtifact = {
            id: activeArt.id,
            title: activeArt.title,
            description: activeArt.description,
            author: activeArt.artist,
            historical_period: activeArt.year,
            origin: "Permanent Collection",
            material: activeArt.medium,
            real_dimensions: "Standard",
            inventory_number: `INV-${activeArt.id.toUpperCase()}`,
            category: "Sculpture",
            model_url: "",
            position_x: 0,
            position_y: 1.4,
            position_z: 0,
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale_x: 1,
            scale_y: 1,
            scale_z: 1,
            display_type: "pedestal",
            shadows_enabled: true,
            light_intensity: 4,
            status: "published",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setInspectingArtifact(staticFull)
          document.exitPointerLock?.()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeArt, locked])

  const handleActiveChange = useCallback((id: string | null) => setActiveId(id), [])
  const handleLockChange = useCallback((l: boolean) => setLocked(l), [])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#c9c4ba]">
      <Canvas
        shadows
        camera={{ fov: 70, near: 0.1, far: 100, position: [0, 1.6, 18] }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#d8d4cb"]} />
        <fog attach="fog" args={["#d8d4cb", 18, 44]} />
        <Suspense fallback={null}>
          <Gallery activeId={activeId} dynamicArtifacts={dynamicArtifacts} />
        </Suspense>
        <Player
          dynamicArtifacts={dynamicArtifacts}
          onActiveChange={handleActiveChange}
          onLockChange={handleLockChange}
        />
      </Canvas>

      {/* Admin Link Button */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/admin"
          className="px-3 py-1.5 text-xs font-medium bg-card/90 text-card-foreground border border-border hover:bg-card rounded-lg backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-lg"
        >
          <ShieldCheck className="h-4 w-4 text-primary" /> Admin Acervo 3D
        </a>
      </div>

      {/* Central Crosshair */}
      {locked && !inspectingArtifact && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/70 ring-2 ring-background/50" />
        </div>
      )}

      {/* Information Panel & Press E to examine */}
      {locked && activeArt && !inspectingArtifact && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 w-[min(92vw,540px)] -translate-x-1/2">
          <div className="rounded-xl border border-border bg-card/90 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold leading-tight text-card-foreground text-balance">
                  {activeArt.title}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {activeArt.artist} · {activeArt.year}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                {activeArt.medium}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-card-foreground/80 text-pretty">
              {activeArt.description}
            </p>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-secondary border border-border rounded font-mono text-[11px] text-secondary-foreground shadow-sm">
                  E
                </kbd>
                Press E to examine 3D model & details
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls Hint */}
      {locked && !inspectingArtifact && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-border bg-card/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md">
          <span className="font-mono font-medium text-card-foreground">W A S D</span> move ·{" "}
          <span className="font-mono font-medium text-card-foreground">Mouse</span> look around ·{" "}
          <span className="font-mono font-medium text-card-foreground">E</span> examine ·{" "}
          <span className="font-mono font-medium text-card-foreground">ESC</span> release
        </div>
      )}

      {/* Start Overlay */}
      {!locked && !inspectingArtifact && <StartOverlay />}

      {/* 3D Inspection Modal */}
      {inspectingArtifact && (
        <InspectionModal
          artifact={inspectingArtifact}
          onClose={() => setInspectingArtifact(null)}
        />
      )}
    </div>
  )
}

function StartOverlay() {
  return (
    <div
      id="enter-museum"
      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-background/70 backdrop-blur-sm"
    >
      <div className="mx-4 max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Jorge Aor Portfolio
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-card-foreground text-balance">
          Galeria Interativa 3D
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          Explore a sculpture collection in first-person view. Walk through the gallery, approach the artworks, and press E to examine 3D models in detail.
        </p>

        <div className="mt-6 space-y-3 text-left">
          <Row icon={<MousePointerClick className="h-4 w-4" />} label="Click anywhere on the screen to start exploring" />
          <Row icon={<Keyboard className="h-4 w-4" />} label="Use W A S D to move around" />
          <Row icon={<Eye className="h-4 w-4" />} label="Press E when close to examine details and audio" />
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <p className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md">
            Click anywhere on the screen to enter
          </p>

          <a
            href="/admin"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/80 px-4 py-2.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-primary" /> Manage 3D Artifacts (Admin Panel)
          </a>
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <span className="text-sm text-card-foreground/80">{label}</span>
    </div>
  )
}
