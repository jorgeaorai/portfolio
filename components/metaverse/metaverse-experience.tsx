"use client"

import { Suspense, useState, useCallback, useMemo, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import { ExternalLink, Globe, Maximize2, Minimize2, X } from "lucide-react"
import { MetaverseLobby } from "./metaverse-lobby"
import { MetaverseHUD } from "./metaverse-hud"
import { ThirdPersonPlayer } from "./third-person-player"
import {
  CyberPlazaScenario,
  getCyberPlazaBounds,
  getCyberPlazaColliders,
  getGalleryRoomLength,
} from "./scenarios/cyber-plaza"
import { SCENARIOS } from "./scenarios-data"
import { AvatarConfig, ScenarioInfo } from "./types"
import { getGalleryCenter, getPlazaPortal } from "./gallery-data"
import {
  createDefaultMetaverseCMSData,
  MediaFrameItem,
  MetaverseCMSData,
} from "@/lib/types/metaverse-cms"

function buildFallbackTotemHtml(frame: MediaFrameItem, roomTitle: string): string {
  const mediaBlock = frame.url?.trim()
    ? frame.mediaType === "video" || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(frame.url)
      ? `<video src="${frame.url}" controls autoplay loop muted playsinline style="width:100%;border-radius:20px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 70px rgba(0,0,0,0.6);"></video>`
      : `<img src="${frame.url}" alt="${frame.title}" style="width:100%;border-radius:20px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 70px rgba(0,0,0,0.6);" />`
    : `<div style="padding:80px 32px;border-radius:20px;border:1px dashed rgba(255,255,255,0.18);background:rgba(255,255,255,0.03);text-align:center;color:#a89b91;">Adicione o código HTML desta Landing Page ou envie um arquivo .html no painel <strong>/admin</strong> para este totem.</div>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d0b0c;
    color: #f4efea;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    padding: 48px 24px 80px;
  }
  .container { max-width: 1080px; margin: 0 auto; }
  .eyebrow {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #d7a374;
    background: rgba(173,123,85,0.14);
    border: 1px solid rgba(173,123,85,0.3);
    padding: 6px 14px;
    border-radius: 999px;
    margin-bottom: 16px;
  }
  h1 {
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 700;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
  }
  p.sub {
    color: #b5a79d;
    font-size: 16px;
    margin-bottom: 36px;
  }
</style>
</head>
<body>
  <div class="container">
    <span class="eyebrow">${roomTitle}</span>
    <h1>${frame.title || "Apresentação do Projeto"}</h1>
    <p class="sub">Role a página para explorar os detalhes deste projeto.</p>
    ${mediaBlock}
  </div>
</body>
</html>`
}

function TotemHtmlModal({
  frame,
  roomTitle,
  onClose,
}: {
  frame: MediaFrameItem
  roomTitle: string
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const customHtml = frame.totemHtml?.trim() || ""
  const customUrl = frame.totemHtmlUrl?.trim() || ""

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col overflow-hidden rounded-2xl border border-stone-700/80 bg-[#110f10] shadow-[0_30px_120px_rgba(0,0,0,0.85)] transition-all ${
          expanded ? "h-[96vh] w-[98vw]" : "h-[88vh] w-full max-w-6xl"
        }`}
      >
        {/* Barra Superior estilo Navegador Web */}
        <div className="flex items-center justify-between gap-4 border-b border-stone-800 bg-stone-950 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="size-3 rounded-full bg-red-500/80 transition hover:bg-red-400"
                title="Fechar"
              />
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="size-3 rounded-full bg-amber-500/80 transition hover:bg-amber-400"
                title="Expandir"
              />
              <span className="size-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-2 truncate rounded-lg border border-stone-800 bg-black/60 px-3 py-1 text-xs text-white">
              <Globe className="size-3.5 shrink-0 text-amber-400" />
              <span className="truncate font-medium text-stone-300">{roomTitle}</span>
              <span className="text-stone-600">/</span>
              <span className="truncate font-semibold text-white">{frame.title || "Projeto"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customUrl && (
              <a
                href={customUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-stone-800"
              >
                <ExternalLink className="size-3.5 text-amber-400" />
                Abrir em nova aba
              </a>
            )}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800 hover:text-white"
              title={expanded ? "Restaurar tamanho" : "Maximizar"}
            >
              {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-500"
            >
              <X className="size-3.5" />
              Fechar
            </button>
          </div>
        </div>

        {/* Conteúdo da Landing Page HTML (rolável como um site) */}
        <div className="relative flex-1 bg-[#0d0b0c]">
          {customHtml ? (
            <iframe
              title={frame.title || "Landing Page do Projeto"}
              srcDoc={customHtml}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : customUrl ? (
            <iframe
              title={frame.title || "Site do Projeto"}
              src={customUrl}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : (
            <iframe
              title={frame.title || "Apresentação do Projeto"}
              srcDoc={buildFallbackTotemHtml(frame, roomTitle)}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function MetaverseExperience() {
  const [inWorld, setInWorld] = useState(false)
  const currentScenario = SCENARIOS[0]
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    nickname: "MetaExplorer",
    color: "#74645a",
    secondaryColor: "#292426",
  })
  const [playerCoords, setPlayerCoords] = useState({ x: 0, y: 0, z: 22 })
  const [playerSpawn, setPlayerSpawn] = useState<[number, number, number]>(SCENARIOS[0].spawnPosition)
  const [playerInstance, setPlayerInstance] = useState(0)
  const [activeGallery, setActiveGallery] = useState<number | null>(null)
  const [cmsData, setCmsData] = useState<MetaverseCMSData>(() => createDefaultMetaverseCMSData())
  const [inspectedTotem, setInspectedTotem] = useState<{
    frame: MediaFrameItem
    roomTitle: string
  } | null>(null)

  const fetchCmsData = useCallback(async () => {
    try {
      const res = await fetch("/api/metaverse-cms", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setCmsData(data)
      }
    } catch {
      // keep fallback
    }
  }, [])

  useEffect(() => {
    fetchCmsData()
    const onFocus = () => fetchCmsData()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [fetchCmsData])

  const handleEnterWorld = (scenario: ScenarioInfo, avatar: AvatarConfig) => {
    setAvatarConfig(avatar)
    setPlayerCoords({
      x: scenario.spawnPosition[0],
      y: scenario.spawnPosition[1],
      z: scenario.spawnPosition[2],
    })
    setPlayerSpawn(scenario.spawnPosition)
    setActiveGallery(null)
    setInspectedTotem(null)
    setInWorld(true)
  }

  const handlePositionChange = useCallback((x: number, y: number, z: number) => {
    setPlayerCoords({ x, y, z })
  }, [])

  const handleEnterGallery = useCallback(
    (index: number) => {
      const [x, , z] = getGalleryCenter(index)
      const room = cmsData.galleries[index]
      const halfLen = getGalleryRoomLength(room) / 2
      const spawn: [number, number, number] = [x, 0, z - (halfLen - 5.5)]
      setActiveGallery(index)
      setInspectedTotem(null)
      setPlayerSpawn(spawn)
      setPlayerCoords({ x: spawn[0], y: spawn[1], z: spawn[2] })
      setPlayerInstance((value) => value + 1)
    },
    [cmsData.galleries]
  )

  const handleExitGallery = useCallback(() => {
    if (activeGallery === null) return
    const totalCount = cmsData.galleries.length || 10
    const { side, position } = getPlazaPortal(activeGallery, totalCount)
    const spawn: [number, number, number] = [side * 27.5, 0, position[2]]
    setActiveGallery(null)
    setInspectedTotem(null)
    setPlayerSpawn(spawn)
    setPlayerCoords({ x: spawn[0], y: spawn[1], z: spawn[2] })
    setPlayerInstance((value) => value + 1)
  }, [activeGallery, cmsData.galleries.length])

  const handleInspectFrame = useCallback((frame: MediaFrameItem, roomTitle: string) => {
    setInspectedTotem({ frame, roomTitle })
  }, [])

  const sceneBounds = useMemo(() => getCyberPlazaBounds(activeGallery, cmsData), [activeGallery, cmsData])
  const sceneColliders = useMemo(() => getCyberPlazaColliders(activeGallery, cmsData), [activeGallery, cmsData])

  // If in Lobby / Menu
  if (!inWorld) {
    return <MetaverseLobby onEnter={handleEnterWorld} />
  }

  // 3D In-World Experience
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a090a] select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows="soft"
        dpr={[1, 1.25]}
        performance={{ min: 0.5 }}
        camera={{
          fov: 65,
          near: 0.1,
          far: 200,
          position: [0, 3, currentScenario.spawnPosition[2] + 6],
        }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.8
        }}
      >
        <color attach="background" args={["#0a090a"]} />
        <fog attach="fog" args={["#211a1a", 52, 125]} />

        <Suspense fallback={null}>
          <CyberPlazaScenario
            playerCoords={playerCoords}
            activeGallery={activeGallery}
            hideLabels={Boolean(inspectedTotem)}
            onEnterGallery={handleEnterGallery}
            onExitGallery={handleExitGallery}
            onInspectFrame={handleInspectFrame}
            cmsData={cmsData}
          />

          {/* Third Person Player Avatar & Camera Controller */}
          <ThirdPersonPlayer
            key={`${currentScenario.id}-${playerInstance}`}
            avatarConfig={avatarConfig}
            spawnPosition={playerSpawn}
            initialCameraYaw={activeGallery !== null ? Math.PI : 0}
            bounds={sceneBounds}
            colliders={sceneColliders}
            onPositionChange={handlePositionChange}
          />
        </Suspense>
      </Canvas>

      {/* Metaverse In-Game HUD */}
      <MetaverseHUD
        avatarConfig={avatarConfig}
        playerCoords={playerCoords}
        activeGallery={activeGallery}
        galleries={cmsData.galleries}
        onSelectGallery={handleEnterGallery}
        onExitGallery={handleExitGallery}
        onBackToLobby={() => setInWorld(false)}
      />

      {/* Totem Interactive HTML Landing Page Modal */}
      {inspectedTotem && (
        <TotemHtmlModal
          frame={inspectedTotem.frame}
          roomTitle={inspectedTotem.roomTitle}
          onClose={() => setInspectedTotem(null)}
        />
      )}
    </div>
  )
}
