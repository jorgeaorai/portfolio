"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Folder,
  LayoutGrid,
  Mail,
  Maximize2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { AvatarConfig } from "./types"
import { BEHANCE_PROFILE_URL } from "./gallery-data"
import { GalleryRoomConfig } from "@/lib/types/metaverse-cms"

interface HUDProps {
  avatarConfig: AvatarConfig
  playerCoords: { x: number; y: number; z: number }
  activeGallery?: number | null
  galleries?: GalleryRoomConfig[]
  onSelectGallery?: (index: number) => void
  onExitGallery?: () => void
  onBackToLobby: () => void
}

export function MetaverseHUD({
  activeGallery = null,
  galleries = [],
  onSelectGallery,
  onExitGallery,
  onBackToLobby,
}: HUDProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [openModal, setOpenModal] = useState<"projetos" | "sobre" | "contato" | null>(null)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const currentGalleryTitle =
    activeGallery !== null && galleries[activeGallery] ? galleries[activeGallery].title : null

  return (
    <>
      {/* TOP BAR: Brand left + Navigation pills center/right */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        {/* Top-Left Brand Identity */}
        <div className="pointer-events-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (activeGallery !== null && onExitGallery) {
                onExitGallery()
              } else {
                onBackToLobby()
              }
            }}
            className="group flex items-center gap-3.5 text-left transition hover:opacity-90"
            title={activeGallery !== null ? "Voltar à Praça Principal" : "Voltar ao Lobby"}
          >
            <span className="text-base font-medium tracking-[0.26em] text-white sm:text-xl">
              JORGE AOR
            </span>
            <span className="h-7 w-px bg-white/25" />
            <div className="flex flex-col">
              <span className="text-[9px] font-medium uppercase leading-tight tracking-[0.24em] text-white/85 sm:text-[10px]">
                PORTFÓLIO
              </span>
              <span className="text-[9px] font-medium uppercase leading-tight tracking-[0.24em] text-white/85 sm:text-[10px]">
                INTERATIVO
              </span>
              <span className="mt-1 h-[1.5px] w-7 bg-[#d88b48]" />
            </div>
          </button>

          {activeGallery !== null && onExitGallery && (
            <button
              type="button"
              onClick={onExitGallery}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-[#d88b48]/40 bg-[#1a120d]/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_0_20px_rgba(216,139,72,0.2)] backdrop-blur-md transition hover:border-[#d88b48] hover:bg-[#2b1d14]"
            >
              <ArrowLeft className="size-3.5 text-[#f0a868]" />
              <span>Voltar à Praça</span>
            </button>
          )}
        </div>

        {/* Top Navigation Pills: Galeria | Projetos | Sobre | Contato */}
        <nav className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setOpenModal(null)
              if (activeGallery !== null && onExitGallery) {
                onExitGallery()
              }
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition sm:px-5 sm:py-2.5 ${
              openModal === null
                ? "border border-[#e39b5c]/50 bg-gradient-to-b from-[#8c522c] to-[#63381c] text-white shadow-[0_0_24px_rgba(204,124,62,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
                : "border border-white/12 bg-[#16110e]/75 text-white/85 backdrop-blur-md hover:border-white/25 hover:bg-[#221a15]"
            }`}
          >
            <LayoutGrid className="size-3.5 text-[#f7c18e]" />
            <span>Galeria</span>
          </button>

          <button
            type="button"
            onClick={() => setOpenModal((prev) => (prev === "projetos" ? null : "projetos"))}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition sm:px-5 sm:py-2.5 ${
              openModal === "projetos"
                ? "border border-[#e39b5c]/50 bg-gradient-to-b from-[#8c522c] to-[#63381c] text-white shadow-[0_0_24px_rgba(204,124,62,0.35)]"
                : "border border-white/12 bg-[#16110e]/75 text-white/85 backdrop-blur-md hover:border-white/25 hover:bg-[#221a15]"
            }`}
          >
            <Folder className="size-3.5 text-white/80" />
            <span>Projetos</span>
          </button>

          <button
            type="button"
            onClick={() => setOpenModal((prev) => (prev === "sobre" ? null : "sobre"))}
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition sm:flex sm:px-5 sm:py-2.5 ${
              openModal === "sobre"
                ? "border border-[#e39b5c]/50 bg-gradient-to-b from-[#8c522c] to-[#63381c] text-white shadow-[0_0_24px_rgba(204,124,62,0.35)]"
                : "border border-white/12 bg-[#16110e]/75 text-white/85 backdrop-blur-md hover:border-white/25 hover:bg-[#221a15]"
            }`}
          >
            <User className="size-3.5 text-white/80" />
            <span>Sobre</span>
          </button>

          <button
            type="button"
            onClick={() => setOpenModal((prev) => (prev === "contato" ? null : "contato"))}
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition sm:flex sm:px-5 sm:py-2.5 ${
              openModal === "contato"
                ? "border border-[#e39b5c]/50 bg-gradient-to-b from-[#8c522c] to-[#63381c] text-white shadow-[0_0_24px_rgba(204,124,62,0.35)]"
                : "border border-white/12 bg-[#16110e]/75 text-white/85 backdrop-blur-md hover:border-white/25 hover:bg-[#221a15]"
            }`}
          >
            <Mail className="size-3.5 text-white/80" />
            <span>Contato</span>
          </button>
        </nav>
      </header>

      {/* BOTTOM BAR: Online status left + Controls center + Action buttons right */}
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        {/* Bottom-Left Online Badge */}
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/10 bg-[#140f0c]/85 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>{currentGalleryTitle ? `Online · ${currentGalleryTitle}` : "Online"}</span>
        </div>

        {/* Bottom-Center Keyboard Controls Pill */}
        <div className="pointer-events-auto hidden items-center gap-5 rounded-full border border-white/10 bg-[#140f0c]/85 px-6 py-2 text-xs text-white/90 shadow-2xl backdrop-blur-md md:flex">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {["W", "A", "S", "D"].map((k) => (
                <kbd
                  key={k}
                  className="grid size-6 place-items-center rounded-md border border-white/15 bg-white/[0.06] font-mono text-[10px] font-medium text-white"
                >
                  {k}
                </kbd>
              ))}
            </div>
            <span className="ml-1 text-white/80">Mover</span>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] font-medium text-white">
              Shift
            </kbd>
            <span className="text-white/80">Correr</span>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] font-medium text-white">
              Espaço
            </kbd>
            <span className="text-white/80">Pular</span>
          </div>
        </div>

        {/* Bottom-Right Fullscreen & Audio Buttons */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="grid size-10 place-items-center rounded-full border border-white/12 bg-[#140f0c]/85 text-white shadow-xl backdrop-blur-md transition hover:border-white/30 hover:bg-[#221914]"
            aria-label="Alternar tela cheia"
            title="Tela cheia"
          >
            <Maximize2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMuted((value) => !value)}
            className="grid size-10 place-items-center rounded-full border border-white/12 bg-[#140f0c]/85 text-white shadow-xl backdrop-blur-md transition hover:border-white/30 hover:bg-[#221914]"
            aria-label={isMuted ? "Ativar áudio" : "Desativar áudio"}
            title={isMuted ? "Ativar áudio" : "Desativar áudio"}
          >
            {isMuted ? <VolumeX className="size-4 text-white/50" /> : <Volume2 className="size-4 text-white" />}
          </button>
        </div>
      </footer>

      {/* QUICK MODALS FOR PROJETOS / SOBRE / CONTATO */}
      {openModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={() => setOpenModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#d88b48]/30 bg-[#140f0d]/95 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e39b5c]">
                  JORGE AOR · PORTFÓLIO INTERATIVO
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {openModal === "projetos"
                    ? "Salas de Projetos"
                    : openModal === "sobre"
                    ? "Sobre Jorge Aor"
                    : "Contato & Redes"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(null)}
                className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {openModal === "projetos" && (
              <div className="grid max-h-[60vh] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {galleries.map((room, idx) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      onSelectGallery?.(idx)
                      setOpenModal(null)
                    }}
                    className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                      activeGallery === idx
                        ? "border-[#e39b5c] bg-[#8c522c]/30 text-white"
                        : "border-white/10 bg-white/[0.04] text-white hover:border-[#e39b5c]/50 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#e39b5c]">
                        Sala #{idx + 1}
                      </span>
                      <p className="mt-0.5 truncate text-sm font-semibold">{room.title}</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-[#e39b5c] transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}

            {openModal === "sobre" && (
              <div className="space-y-4 text-sm leading-relaxed text-white/85">
                <p>
                  Designer focado em direção criativa, branding, identidade visual, campanhas,
                  experiências digitais e projetos editoriais.
                </p>
                <p>
                  Neste universo interativo 3D, você pode caminhar pela praça principal, entrar nas
                  salas dedicadas a cada projeto e interagir com os totens para explorar as
                  apresentações completas.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onBackToLobby}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <ArrowLeft className="size-3.5" /> Trocar Avatar / Voltar ao Lobby
                  </button>
                </div>
              </div>
            )}

            {openModal === "contato" && (
              <div className="space-y-4 text-sm text-white/85">
                <p>Entre em contato ou confira o portfólio completo nas plataformas oficiais:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="mailto:jorgeaorf@gmail.com"
                    className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.05] p-4 transition hover:border-[#e39b5c]/60 hover:bg-white/[0.1]"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#e39b5c]">
                        E-mail
                      </span>
                      <p className="mt-0.5 font-semibold text-white">jorgeaorf@gmail.com</p>
                    </div>
                    <Mail className="size-4 text-[#e39b5c]" />
                  </a>

                  <a
                    href={BEHANCE_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.05] p-4 transition hover:border-[#e39b5c]/60 hover:bg-white/[0.1]"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#e39b5c]">
                        Portfólio Oficial
                      </span>
                      <p className="mt-0.5 font-semibold text-white">Behance · Jorge Aor</p>
                    </div>
                    <ExternalLink className="size-4 text-[#e39b5c]" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
