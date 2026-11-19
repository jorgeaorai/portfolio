"use client"

import React, { Suspense, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { MuseumArtifact } from "@/lib/types/artifact"
import { X, Volume2, Info, Maximize2, ShieldCheck, Tag } from "lucide-react"

interface InspectionModalProps {
  artifact: MuseumArtifact
  onClose: () => void
}

function GlbViewer({ url, shadowsEnabled }: { url: string; shadowsEnabled: boolean }) {
  const { scene } = useGLTF(url)

  return (
    <primitive
      object={scene}
      castShadow={shadowsEnabled}
      receiveShadow={shadowsEnabled}
    />
  )
}

export function InspectionModal({ artifact, onClose }: InspectionModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col lg:flex-row h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background transition-colors border border-border"
          title="Close Inspection (ESC)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 3D Interactive Viewport (Left Side) */}
        <div className="relative flex-1 bg-[#121216] min-h-[350px] lg:min-h-full">
          <Canvas
            shadows
            camera={{ position: [0, 1.2, 3], fov: 45 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#121216"]} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 8, 5]} intensity={3} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={1} />
            <pointLight position={[0, -2, 0]} intensity={1.5} color="#ffd880" />

            <group position={[0, -0.4, 0]}>
              {artifact.model_url ? (
                <Suspense fallback={null}>
                  <GlbViewer url={artifact.model_url} shadowsEnabled={artifact.shadows_enabled} />
                </Suspense>
              ) : (
                <mesh>
                  <torusKnotGeometry args={[0.5, 0.16, 128, 16]} />
                  <meshStandardMaterial color="#c69a2e" metalness={0.9} roughness={0.1} />
                </mesh>
              )}
            </group>

            <OrbitControls autoRotate autoRotateSpeed={0.8} enableZoom enablePan />
          </Canvas>

          <div className="absolute bottom-4 left-4 pointer-events-none rounded-lg bg-background/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md border border-border">
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* Metadata Details Sidebar (Right Side) */}
        <div className="w-full lg:w-[420px] overflow-y-auto p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border bg-card">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                  {artifact.category || "Sculpture"}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Inv: {artifact.inventory_number}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-card-foreground leading-tight">
                {artifact.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {artifact.author || "Unknown Creator"} · {artifact.historical_period || "Historical Period N/A"}
              </p>
            </div>

            {/* Audio Description Player */}
            {artifact.audio_url && (
              <div className="rounded-xl border border-border bg-secondary/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-secondary-foreground">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-primary" /> Audio Description
                  </span>
                </div>
                <audio ref={audioRef} controls src={artifact.audio_url} className="w-full h-8 text-xs" />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> About the Artwork
              </h3>
              <p className="text-sm leading-relaxed text-card-foreground/80 text-pretty">
                {artifact.description || "No description available for this artifact."}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
              <h3 className="font-semibold uppercase tracking-wider text-muted-foreground">
                Catalog Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary/40 p-2.5 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">Material</span>
                  <span className="font-medium text-card-foreground">{artifact.material || "N/A"}</span>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2.5 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">Origin</span>
                  <span className="font-medium text-card-foreground">{artifact.origin || "N/A"}</span>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2.5 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">Real Dimensions</span>
                  <span className="font-medium text-card-foreground">{artifact.real_dimensions || "N/A"}</span>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2.5 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">Display Type</span>
                  <span className="font-medium text-card-foreground capitalize">{artifact.display_type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Digitalized Heritage Item
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Resume Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
