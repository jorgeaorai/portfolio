"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCode2,
  Film,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Lock,
  LogOut,
  MonitorPlay,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import {
  createDefaultMetaverseCMSData,
  GalleryRoomConfig,
  MediaFrameItem,
  MediaType,
  MetaverseCMSData,
  PlazaWallFrameItem,
} from "@/lib/types/metaverse-cms"

const SESSION_STORAGE_KEY = "jaor_admin_session_token_v1"

function MediaPreview({ url, mediaType }: { url: string; mediaType: MediaType }) {
  const cleanUrl = url?.trim()
  if (!cleanUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-stone-800 bg-black/60 text-xs text-stone-500">
        {mediaType === "video" ? (
          <Film className="mb-2 size-6 text-stone-600" />
        ) : (
          <ImageIcon className="mb-2 size-6 text-stone-600" />
        )}
        <span>Sem mídia selecionada (1920×1080 · 16:9)</span>
      </div>
    )
  }

  const isVideo =
    mediaType === "video" || /\.(mp4|webm|mov|m4v|ogg|ogv)(\?.*)?$/i.test(cleanUrl)

  if (isVideo) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-stone-700/60 bg-black">
        <video
          key={cleanUrl}
          src={cleanUrl}
          className="h-full w-full object-contain"
          controls
          muted
          loop
          playsInline
        />
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-amber-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          Vídeo · 16:9
        </span>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-stone-700/60 bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cleanUrl} alt="Preview" className="h-full w-full object-contain" />
      <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-stone-700/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
        Imagem · 16:9
      </span>
    </div>
  )
}

function MediaTypeSwitch({
  value,
  onChange,
}: {
  value: MediaType
  onChange: (next: MediaType) => void
}) {
  return (
    <div className="inline-flex rounded-xl border border-stone-800 bg-stone-950 p-1">
      <button
        type="button"
        onClick={() => onChange("video")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          value === "video"
            ? "bg-amber-600 text-white shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        <Film className="size-3.5" /> Vídeo
      </button>
      <button
        type="button"
        onClick={() => onChange("image")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          value === "image"
            ? "bg-amber-600 text-white shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        <ImageIcon className="size-3.5" /> Imagem
      </button>
    </div>
  )
}

export default function MetaverseAdminPage() {
  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // CMS state
  const [cmsData, setCmsData] = useState<MetaverseCMSData>(() => createDefaultMetaverseCMSData())
  const [loadingCms, setLoadingCms] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  // UI Navigation state
  const [activeTab, setActiveTab] = useState<"galleries" | "stage" | "plaza">("galleries")
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0)
  const [editingTotem, setEditingTotem] = useState<{
    galleryIndex: number
    side: "left" | "right"
    frameId: string
  } | null>(null)

  useEffect(() => {
    const savedToken = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (savedToken) {
      setAuthToken(savedToken)
    }
    setAuthChecking(false)
  }, [])

  useEffect(() => {
    async function loadCms() {
      setLoadingCms(true)
      try {
        const res = await fetch("/api/metaverse-cms", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setCmsData(data)
        }
      } catch (err) {
        console.error("Failed to fetch CMS data:", err)
      } finally {
        setLoadingCms(false)
      }
    }
    loadCms()
  }, [])

  function showToast(type: "success" | "error", text: string) {
    setStatusMessage({ type, text })
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev))
    }, 4500)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoggingIn(true)
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      })
      const data = await res.json()
      if (!res.ok || !data.authenticated) {
        setLoginError(data.error || "E-mail ou senha incorretos.")
        return
      }
      window.localStorage.setItem(SESSION_STORAGE_KEY, data.token)
      setAuthToken(data.token)
    } catch {
      setLoginError("Erro ao conectar ao servidor.")
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    setAuthToken(null)
    setPasswordInput("")
    await fetch("/api/admin-auth", { method: "DELETE" }).catch(() => {})
  }

  async function persistCmsData(nextData: MetaverseCMSData, silentMessage?: string) {
    if (!authToken) return
    setSaving(true)
    try {
      const res = await fetch("/api/metaverse-cms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": authToken,
        },
        body: JSON.stringify({ data: nextData }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao salvar alterações")
      }
      const saved = await res.json()
      setCmsData(saved)
      showToast("success", silentMessage || "Alterações salvas e publicadas no Metaverso 3D!")
    } catch (err: any) {
      showToast("error", err.message || "Falha ao salvar alterações.")
    } finally {
      setSaving(false)
    }
  }

  async function uploadMediaFile(
    file: File,
    slotId: string,
    onUploaded: (url: string, detectedType: MediaType) => MetaverseCMSData
  ) {
    setUploadingId(slotId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "media")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro no upload do arquivo")
      }

      const nextCms = onUploaded(data.url, data.mediaType as MediaType)
      setCmsData(nextCms)
      await persistCmsData(nextCms, `Arquivo "${file.name}" enviado e salvo com sucesso!`)
    } catch (err: any) {
      showToast("error", err.message || "Erro ao enviar arquivo")
    } finally {
      setUploadingId(null)
    }
  }

  // Helpers for updating a specific gallery room
  const selectedGallery: GalleryRoomConfig | undefined =
    cmsData.galleries[selectedGalleryIndex] || cmsData.galleries[0]

  function updateGallery(index: number, updater: (room: GalleryRoomConfig) => GalleryRoomConfig) {
    setCmsData((prev) => {
      const nextGalleries = prev.galleries.map((g, i) => (i === index ? updater(g) : g))
      return { ...prev, galleries: nextGalleries }
    })
  }

  function handleAddGalleryRoom() {
    const newIndex = cmsData.galleries.length + 1
    const newRoom: GalleryRoomConfig = {
      id: `gallery-${Date.now()}`,
      title: `Novo Trabalho ${newIndex}`,
      subtitle: "GALERIA DE PROJETO",
      backWall: {
        mediaType: "video",
        url: "",
      },
      leftFrames: [1, 2, 3].map((n) => ({
        id: `frame-left-${Date.now()}-${n}`,
        title: `Quadro Esquerdo ${n}`,
        mediaType: "image",
        url: "",
      })),
      rightFrames: [1, 2, 3].map((n) => ({
        id: `frame-right-${Date.now()}-${n}`,
        title: `Quadro Direito ${n}`,
        mediaType: "image",
        url: "",
      })),
    }

    const nextData: MetaverseCMSData = {
      ...cmsData,
      galleries: [...cmsData.galleries, newRoom],
    }
    setCmsData(nextData)
    setSelectedGalleryIndex(nextData.galleries.length - 1)
    void persistCmsData(nextData, "Nova sala de trabalho adicionada!")
  }

  function handleDeleteGalleryRoom(index: number) {
    if (cmsData.galleries.length <= 1) {
      showToast("error", "É necessário manter pelo menos 1 sala de trabalho.")
      return
    }
    const roomTitle = cmsData.galleries[index]?.title || "Sala"
    if (!window.confirm(`Deseja realmente remover a sala "${roomTitle}"?`)) return

    const nextGalleries = cmsData.galleries.filter((_, i) => i !== index)
    const nextData: MetaverseCMSData = {
      ...cmsData,
      galleries: nextGalleries,
    }
    setCmsData(nextData)
    setSelectedGalleryIndex(Math.max(0, Math.min(selectedGalleryIndex, nextGalleries.length - 1)))
    void persistCmsData(nextData, `Sala "${roomTitle}" removida.`)
  }

  function handleAddWallFrame(side: "left" | "right") {
    if (!selectedGallery) return
    const listKey = side === "left" ? "leftFrames" : "rightFrames"
    const currentList = selectedGallery[listKey]
    const newFrame: MediaFrameItem = {
      id: `frame-${side}-${Date.now()}`,
      title: `Quadro ${side === "left" ? "Esquerdo" : "Direito"} ${currentList.length + 1}`,
      mediaType: "image",
      url: "",
    }

    updateGallery(selectedGalleryIndex, (room) => ({
      ...room,
      [listKey]: [...room[listKey], newFrame],
    }))
  }

  function handleRemoveWallFrame(side: "left" | "right", frameId: string) {
    const listKey = side === "left" ? "leftFrames" : "rightFrames"
    updateGallery(selectedGalleryIndex, (room) => ({
      ...room,
      [listKey]: room[listKey].filter((f) => f.id !== frameId),
    }))
  }

  function handleMoveWallFrame(side: "left" | "right", index: number, direction: -1 | 1) {
    const listKey = side === "left" ? "leftFrames" : "rightFrames"
    updateGallery(selectedGalleryIndex, (room) => {
      const list = [...room[listKey]]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= list.length) return room
      const [item] = list.splice(index, 1)
      list.splice(targetIndex, 0, item)
      return { ...room, [listKey]: list }
    })
  }

  function handleAddPlazaFrame(side: "left" | "right") {
    const sideFrames = cmsData.plazaFrames.filter((f) => f.side === side)
    const lastZ = sideFrames.length > 0 ? sideFrames[sideFrames.length - 1].zOffset : -20
    const nextZ = Math.min(22, Math.max(-22, lastZ + 6))
    const newFrame: PlazaWallFrameItem = {
      id: `plaza-${side}-${Date.now()}`,
      side,
      title: `Painel Praça ${side === "left" ? "Esquerda" : "Direita"} ${sideFrames.length + 1}`,
      mediaType: "image",
      url: "",
      zOffset: nextZ,
    }
    setCmsData((prev) => ({
      ...prev,
      plazaFrames: [...prev.plazaFrames, newFrame],
    }))
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a090a] text-stone-300">
        <Loader2 className="size-6 animate-spin text-amber-500" />
      </div>
    )
  }

  // LOGIN SCREEN (Restricted to jorgeaorf@gmail.com)
  if (!authToken) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a090a] px-4 font-sans text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(173,123,85,0.16),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(91,76,78,0.2),transparent_40%)]" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-stone-950/85 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Lock className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500">
                Acesso Restrito
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-white">Admin · Jorge Aor</h1>
            </div>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-stone-400">
            Entre com suas credenciais exclusivas de administrador para gerenciar o palco, vídeos,
            imagens, trabalhos e quadros do portfólio 3D.
          </p>

          {loginError && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-300">E-mail</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="jorgeaorf@gmail.com"
                className="h-12 w-full rounded-xl border border-white/15 bg-black/60 px-4 text-sm text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-300">Senha</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••"
                className="h-12 w-full rounded-xl border border-white/15 bg-black/60 px-4 text-sm text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
            >
              {loggingIn ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {loggingIn ? "Verificando..." : "Entrar no Painel Admin"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link
              href="/metaverso"
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-white"
            >
              <ExternalLink className="size-3.5" /> Ir para o Metaverso 3D
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a090a] text-stone-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 font-bold text-amber-400">
              JA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Gerenciador do Portfólio 3D
                </h1>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                  jorgeaorf@gmail.com
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Controle vídeos, imagens, palco, salas de trabalhos e quadros nas paredes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/metaverso"
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-xs font-semibold text-stone-200 transition hover:border-stone-500 hover:bg-stone-800"
            >
              <ExternalLink className="size-4 text-amber-400" />
              Ver Metaverso 3D
            </Link>

            <button
              type="button"
              onClick={() => persistCmsData(cmsData)}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-950/50 transition hover:bg-amber-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-950 px-3.5 py-2.5 text-xs font-medium text-stone-400 transition hover:border-red-500/40 hover:text-red-300"
              title="Sair"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Status Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-stone-700 bg-stone-900/95 px-5 py-3.5 text-sm shadow-2xl backdrop-blur-xl">
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="size-5 text-emerald-400" />
          ) : (
            <X className="size-5 text-red-400" />
          )}
          <span className="font-medium text-white">{statusMessage.text}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Main Section Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-stone-800/80 bg-stone-950/60 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("galleries")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "galleries"
                ? "bg-amber-600 text-white shadow-lg"
                : "text-stone-400 hover:bg-stone-900 hover:text-white"
            }`}
          >
            <FolderKanban className="size-4" />
            Salas & Trabalhos ({cmsData.galleries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stage")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "stage"
                ? "bg-amber-600 text-white shadow-lg"
                : "text-stone-400 hover:bg-stone-900 hover:text-white"
            }`}
          >
            <MonitorPlay className="size-4" />
            Telão do Palco Principal
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plaza")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "plaza"
                ? "bg-amber-600 text-white shadow-lg"
                : "text-stone-400 hover:bg-stone-900 hover:text-white"
            }`}
          >
            <LayoutGrid className="size-4" />
            Paredões da Praça Externa ({cmsData.plazaFrames.length})
          </button>
        </div>

        {loadingCms ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-stone-800 bg-stone-950/50">
            <Loader2 className="size-6 animate-spin text-amber-500" />
          </div>
        ) : activeTab === "stage" ? (
          /* ================= TAB 2: PALCO PRINCIPAL ================= */
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6 rounded-3xl border border-stone-800 bg-stone-950/70 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-5">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-500">
                    Praça Central
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-white">Telão do Palco Principal</h2>
                  <p className="mt-1 text-xs text-stone-400">
                    Defina o vídeo ou imagem exibido no grande telão do palco (20m × 11m).
                  </p>
                </div>

                <MediaTypeSwitch
                  value={cmsData.stage.mediaType}
                  onChange={(mediaType) =>
                    setCmsData((prev) => ({
                      ...prev,
                      stage: { ...prev.stage, mediaType },
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-300">
                    Enviar Arquivo ({cmsData.stage.mediaType === "video" ? "Vídeo MP4/WebM/MOV" : "Imagem JPG/PNG/WebP"})
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-amber-500">
                      {uploadingId === "stage-main" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      <span>
                        {uploadingId === "stage-main"
                          ? "Enviando arquivo..."
                          : "Escolher Vídeo ou Imagem do Computador"}
                      </span>
                      <input
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        disabled={uploadingId === "stage-main"}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          void uploadMediaFile(file, "stage-main", (url, detectedType) => ({
                            ...cmsData,
                            stage: {
                              ...cmsData.stage,
                              url,
                              mediaType: detectedType,
                            },
                          }))
                        }}
                      />
                    </label>

                    {cmsData.stage.url && (
                      <button
                        type="button"
                        onClick={() =>
                          setCmsData((prev) => ({
                            ...prev,
                            stage: { ...prev.stage, url: "" },
                          }))
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900 px-3.5 py-2.5 text-xs font-medium text-stone-300 hover:border-red-500/40 hover:text-red-300"
                      >
                        <Trash2 className="size-3.5" /> Remover mídia
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">
                    Ou cole a URL direta do vídeo/imagem
                  </label>
                  <input
                    type="text"
                    value={cmsData.stage.url}
                    onChange={(e) =>
                      setCmsData((prev) => ({
                        ...prev,
                        stage: { ...prev.stage, url: e.target.value },
                      }))
                    }
                    placeholder="/uploads/meu-video-palco.mp4 ou https://..."
                    className="h-11 w-full rounded-xl border border-stone-800 bg-black/60 px-4 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="border-t border-stone-800 pt-5">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cmsData.stage.showTextOverlay}
                      onChange={(e) =>
                        setCmsData((prev) => ({
                          ...prev,
                          stage: { ...prev.stage, showTextOverlay: e.target.checked },
                        }))
                      }
                      className="size-4 accent-amber-600"
                    />
                    <span className="text-sm font-medium text-stone-200">
                      Exibir texto 3D sobreposto no telão do palco
                    </span>
                  </label>

                  {cmsData.stage.showTextOverlay && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-stone-400">Título no Palco</label>
                        <input
                          type="text"
                          value={cmsData.stage.title}
                          onChange={(e) =>
                            setCmsData((prev) => ({
                              ...prev,
                              stage: { ...prev.stage, title: e.target.value },
                            }))
                          }
                          className="h-10 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-sm text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-stone-400">Subtítulo no Palco</label>
                        <input
                          type="text"
                          value={cmsData.stage.subtitle}
                          onChange={(e) =>
                            setCmsData((prev) => ({
                              ...prev,
                              stage: { ...prev.stage, subtitle: e.target.value },
                            }))
                          }
                          className="h-10 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-sm text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-stone-800 bg-stone-950/70 p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                Pré-visualização do Telão do Palco
              </h3>
              <div className="mt-2">
                <MediaPreview url={cmsData.stage.url} mediaType={cmsData.stage.mediaType} />
              </div>
              <p className="text-xs leading-relaxed text-stone-400">
                Dica: Você pode colocar um vídeo em loop (MP4/WebM) ou uma imagem em alta resolução.
                Para deixar apenas o vídeo limpo no palco sem letras na frente, basta desmarcar a
                opção &ldquo;Exibir texto 3D sobreposto&rdquo; e clicar em Salvar.
              </p>
            </section>
          </div>
        ) : activeTab === "galleries" ? (
          /* ================= TAB 1: SALAS & TRABALHOS ================= */
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Sidebar list of Project Rooms */}
            <aside className="space-y-4 rounded-3xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="flex items-center justify-between px-2 pt-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Trabalhos / Salas ({cmsData.galleries.length})
                </h2>
                <button
                  type="button"
                  onClick={handleAddGalleryRoom}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600/20 px-2.5 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-600 hover:text-white"
                >
                  <Plus className="size-3.5" /> Nova Sala
                </button>
              </div>

              <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
                {cmsData.galleries.map((room, idx) => {
                  const isSelected = idx === selectedGalleryIndex
                  const totalFrames = room.leftFrames.length + room.rightFrames.length
                  const hasBackMedia = Boolean(room.backWall?.url?.trim())
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedGalleryIndex(idx)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-amber-500/60 bg-amber-500/15 text-white shadow"
                          : "border-stone-800/70 bg-stone-900/50 text-stone-300 hover:border-stone-700 hover:bg-stone-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Sala #{idx + 1} ({idx < Math.ceil(cmsData.galleries.length / 2) ? "Lado Esq." : "Lado Dir."})
                        </span>
                        {hasBackMedia && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                            Fundo ativo
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold">{room.title}</p>
                      <p className="mt-0.5 text-[11px] text-stone-400">
                        {totalFrames} quadros ({room.leftFrames.length} esq · {room.rightFrames.length} dir)
                      </p>
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Selected Room Editor */}
            {selectedGallery && (
              <div className="space-y-8">
                {/* 1. Room Header & Title */}
                <section className="rounded-3xl border border-stone-800 bg-stone-950/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
                        Configuração da Sala #{selectedGalleryIndex + 1}
                      </span>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-400">
                          Nome do Trabalho (aparece na placa acima da porta na praça)
                        </label>
                        <input
                          type="text"
                          value={selectedGallery.title}
                          onChange={(e) =>
                            updateGallery(selectedGalleryIndex, (room) => ({
                              ...room,
                              title: e.target.value,
                            }))
                          }
                          className="h-12 w-full max-w-xl rounded-xl border border-stone-700 bg-black/60 px-4 text-base font-semibold text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryRoom(selectedGalleryIndex)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-400 transition hover:border-red-500/40 hover:text-red-300"
                    >
                      <Trash2 className="size-4" /> Excluir Sala
                    </button>
                  </div>
                </section>

                {/* 2. Parede do Fundo da Sala (Telão onde fica preto) */}
                <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-950 via-stone-950 to-amber-950/15 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-400">
                        <Sparkles className="size-3.5" /> Parede do Fundo da Sala (Telão Principal)
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-white">
                        Fundo da Sala — Vídeo ou Imagem
                      </h3>
                      <p className="text-xs text-stone-400">
                        Preenche toda a parede preta ao fundo da sala ({selectedGallery.title}).
                      </p>
                    </div>

                    <MediaTypeSwitch
                      value={selectedGallery.backWall?.mediaType || "video"}
                      onChange={(mediaType) =>
                        updateGallery(selectedGalleryIndex, (room) => ({
                          ...room,
                          backWall: { ...room.backWall, mediaType },
                        }))
                      }
                    />
                  </div>

                  <div className="mt-5 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-amber-500">
                          {uploadingId === `backwall-${selectedGallery.id}` ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                          <span>
                            {uploadingId === `backwall-${selectedGallery.id}`
                              ? "Enviando..."
                              : "Enviar Vídeo ou Imagem para o Fundo"}
                          </span>
                          <input
                            type="file"
                            accept="video/*,image/*"
                            className="hidden"
                            disabled={uploadingId === `backwall-${selectedGallery.id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              void uploadMediaFile(
                                file,
                                `backwall-${selectedGallery.id}`,
                                (url, detectedType) => ({
                                  ...cmsData,
                                  galleries: cmsData.galleries.map((g, i) =>
                                    i === selectedGalleryIndex
                                      ? {
                                          ...g,
                                          backWall: { url, mediaType: detectedType },
                                        }
                                      : g
                                  ),
                                })
                              )
                            }}
                          />
                        </label>

                        {selectedGallery.backWall?.url && (
                          <button
                            type="button"
                            onClick={() =>
                              updateGallery(selectedGalleryIndex, (room) => ({
                                ...room,
                                backWall: { ...room.backWall, url: "" },
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2.5 text-xs text-stone-300 hover:border-red-500/40 hover:text-red-300"
                          >
                            <Trash2 className="size-3.5" /> Limpar Fundo
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-stone-400">
                          URL do vídeo ou imagem do fundo da sala
                        </label>
                        <input
                          type="text"
                          value={selectedGallery.backWall?.url || ""}
                          onChange={(e) =>
                            updateGallery(selectedGalleryIndex, (room) => ({
                              ...room,
                              backWall: { ...room.backWall, url: e.target.value },
                            }))
                          }
                          placeholder="/uploads/video-fundo-sala.mp4 ou https://..."
                          className="h-11 w-full rounded-xl border border-stone-800 bg-black/60 px-4 text-sm text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <MediaPreview
                      url={selectedGallery.backWall?.url || ""}
                      mediaType={selectedGallery.backWall?.mediaType || "video"}
                    />
                  </div>
                </section>

                {/* 3. Quadros nas Paredes Laterais (Esquerda e Direita) */}
                {(["left", "right"] as const).map((side) => {
                  const isLeft = side === "left"
                  const frames = isLeft ? selectedGallery.leftFrames : selectedGallery.rightFrames
                  const listKey = isLeft ? "leftFrames" : "rightFrames"

                  return (
                    <section
                      key={side}
                      className="space-y-5 rounded-3xl border border-stone-800 bg-stone-950/70 p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
                            Galeria Interna · {isLeft ? "Lado Esquerdo" : "Lado Direito"}
                          </span>
                          <h3 className="mt-0.5 text-lg font-bold text-white">
                            Quadros da Parede {isLeft ? "Esquerda" : "Direita"} ({frames.length})
                          </h3>
                          <p className="text-xs text-stone-400">
                            Cada quadro pode exibir Imagem ou Vídeo. Adicione quantos quadros quiser
                            — a sala se adapta automaticamente!
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddWallFrame(side)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-amber-500"
                        >
                          <Plus className="size-4" />
                          Adicionar Quadro na Parede {isLeft ? "Esquerda" : "Direita"}
                        </button>
                      </div>

                      {frames.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-stone-800 p-8 text-center text-sm text-stone-500">
                          Nenhum quadro nesta parede. Clique em &ldquo;Adicionar Quadro&rdquo; acima.
                        </div>
                      ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {frames.map((frame, fIdx) => {
                            const slotUploadId = `${selectedGallery.id}-${frame.id}`
                            return (
                              <div
                                key={frame.id}
                                className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-800 bg-stone-900/50 p-4"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="rounded-lg bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                                      Quadro #{fIdx + 1}
                                    </span>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleMoveWallFrame(side, fIdx, -1)}
                                        disabled={fIdx === 0}
                                        className="rounded-lg border border-stone-800 bg-stone-950 p-1.5 text-stone-400 hover:text-white disabled:opacity-30"
                                        title="Mover antes"
                                      >
                                        <ArrowUp className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveWallFrame(side, fIdx, 1)}
                                        disabled={fIdx === frames.length - 1}
                                        className="rounded-lg border border-stone-800 bg-stone-950 p-1.5 text-stone-400 hover:text-white disabled:opacity-30"
                                        title="Mover depois"
                                      >
                                        <ArrowDown className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveWallFrame(side, frame.id)}
                                        className="rounded-lg border border-stone-800 bg-stone-950 p-1.5 text-stone-400 hover:border-red-500/40 hover:text-red-400"
                                        title="Remover quadro"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <MediaPreview url={frame.url} mediaType={frame.mediaType} />

                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-stone-400">Tipo de mídia:</span>
                                    <MediaTypeSwitch
                                      value={frame.mediaType}
                                      onChange={(mediaType) =>
                                        updateGallery(selectedGalleryIndex, (room) => ({
                                          ...room,
                                          [listKey]: room[listKey].map((item) =>
                                            item.id === frame.id ? { ...item, mediaType } : item
                                          ),
                                        }))
                                      }
                                    />
                                  </div>

                                  <div>
                                    <input
                                      type="text"
                                      value={frame.title}
                                      onChange={(e) =>
                                        updateGallery(selectedGalleryIndex, (room) => ({
                                          ...room,
                                          [listKey]: room[listKey].map((item) =>
                                            item.id === frame.id
                                              ? { ...item, title: e.target.value }
                                              : item
                                          ),
                                        }))
                                      }
                                      placeholder="Título / identificação do quadro"
                                      className="h-9 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-xs text-white outline-none focus:border-amber-500"
                                    />
                                  </div>

                                  <div>
                                    <input
                                      type="text"
                                      value={frame.url}
                                      onChange={(e) =>
                                        updateGallery(selectedGalleryIndex, (room) => ({
                                          ...room,
                                          [listKey]: room[listKey].map((item) =>
                                            item.id === frame.id
                                              ? { ...item, url: e.target.value }
                                              : item
                                          ),
                                        }))
                                      }
                                      placeholder="URL do vídeo ou imagem..."
                                      className="h-9 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-xs text-white outline-none focus:border-amber-500"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-amber-600 hover:text-white">
                                    {uploadingId === slotUploadId ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Upload className="size-3.5" />
                                    )}
                                    <span>
                                      {uploadingId === slotUploadId
                                        ? "Enviando..."
                                        : "Enviar Vídeo/Imagem"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="video/*,image/*"
                                      className="hidden"
                                      disabled={uploadingId === slotUploadId}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        void uploadMediaFile(
                                          file,
                                          slotUploadId,
                                          (url, detectedType) => ({
                                            ...cmsData,
                                            galleries: cmsData.galleries.map((g, i) =>
                                              i === selectedGalleryIndex
                                                ? {
                                                    ...g,
                                                    [listKey]: g[listKey].map((item) =>
                                                      item.id === frame.id
                                                        ? { ...item, url, mediaType: detectedType }
                                                        : item
                                                    ),
                                                  }
                                                : g
                                            ),
                                          })
                                        )
                                      }}
                                    />
                                  </label>

                                    {frame.url && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateGallery(selectedGalleryIndex, (room) => ({
                                            ...room,
                                            [listKey]: room[listKey].map((item) =>
                                              item.id === frame.id ? { ...item, url: "" } : item
                                            ),
                                          }))
                                        }
                                        className="rounded-xl border border-stone-700 bg-stone-950 px-2.5 py-2 text-xs text-stone-400 hover:text-red-300"
                                        title="Limpar mídia"
                                      >
                                        Limpar
                                      </button>
                                    )}
                                  </div>

                                  {/* Seção do Totem Interativo (LP em HTML) embaixo deste quadro */}
                                  <div className="mt-3 space-y-2.5 rounded-xl border border-amber-500/25 bg-black/50 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                                        <Code2 className="size-3.5" /> Totem · LP HTML
                                      </span>
                                      {frame.totemHtml?.trim() || frame.totemHtmlUrl?.trim() ? (
                                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                          LP configurada
                                        </span>
                                      ) : (
                                        <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-400">
                                          Padrão
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingTotem({
                                            galleryIndex: selectedGalleryIndex,
                                            side,
                                            frameId: frame.id,
                                          })
                                        }
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-600/90 px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-amber-500"
                                      >
                                        <FileCode2 className="size-3.5" />
                                        Editar HTML da LP / Site
                                      </button>

                                      <label
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-2 text-xs font-medium text-stone-200 transition hover:border-amber-500/50 hover:text-white"
                                        title="Importar arquivo .html do computador"
                                      >
                                        <Upload className="size-3.5 text-amber-400" />
                                        <span>.HTML</span>
                                        <input
                                          type="file"
                                          accept=".html,.htm,text/html"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            const htmlContent = await file.text()
                                            const nextCms: MetaverseCMSData = {
                                              ...cmsData,
                                              galleries: cmsData.galleries.map((g, i) =>
                                                i === selectedGalleryIndex
                                                  ? {
                                                      ...g,
                                                      [listKey]: g[listKey].map((item) =>
                                                        item.id === frame.id
                                                          ? { ...item, totemHtml: htmlContent }
                                                          : item
                                                      ),
                                                    }
                                                  : g
                                              ),
                                            }
                                            setCmsData(nextCms)
                                            await persistCmsData(
                                              nextCms,
                                              `LP HTML "${file.name}" importada para o totem de ${frame.title}!`
                                            )
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                            )
                          })}
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================= TAB 3: PAREDÕES DA PRAÇA EXTERNA ================= */
          <div className="space-y-8">
            {(["left", "right"] as const).map((side) => {
              const isLeft = side === "left"
              const frames = cmsData.plazaFrames.filter((f) => f.side === side)

              return (
                <section
                  key={side}
                  className="space-y-5 rounded-3xl border border-stone-800 bg-stone-950/70 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
                        Praça Externa · Paredão {isLeft ? "Esquerdo" : "Direito"}
                      </span>
                      <h3 className="mt-0.5 text-lg font-bold text-white">
                        Quadros Superiores da Praça ({frames.length})
                      </h3>
                      <p className="text-xs text-stone-400">
                        Painéis exibidos no alto dos paredões laterais da praça principal (acima das
                        portas). Suportam vídeo ou imagem.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPlazaFrame(side)}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-amber-500"
                    >
                      <Plus className="size-4" />
                      Adicionar Painel ({isLeft ? "Esquerda" : "Direita"})
                    </button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {frames.map((frame, idx) => {
                      const slotUploadId = `plaza-${frame.id}`
                      return (
                        <div
                          key={frame.id}
                          className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-800 bg-stone-900/50 p-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="rounded-lg bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                                Painel #{idx + 1} (Z: {frame.zOffset})
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCmsData((prev) => ({
                                    ...prev,
                                    plazaFrames: prev.plazaFrames.filter((f) => f.id !== frame.id),
                                  }))
                                }
                                className="rounded-lg border border-stone-800 bg-stone-950 p-1.5 text-stone-400 hover:border-red-500/40 hover:text-red-400"
                                title="Remover painel"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            <MediaPreview url={frame.url} mediaType={frame.mediaType} />

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-stone-400">Tipo:</span>
                              <MediaTypeSwitch
                                value={frame.mediaType}
                                onChange={(mediaType) =>
                                  setCmsData((prev) => ({
                                    ...prev,
                                    plazaFrames: prev.plazaFrames.map((f) =>
                                      f.id === frame.id ? { ...f, mediaType } : f
                                    ),
                                  }))
                                }
                              />
                            </div>

                            <div className="grid grid-cols-[1fr_90px] gap-2">
                              <input
                                type="text"
                                value={frame.title}
                                onChange={(e) =>
                                  setCmsData((prev) => ({
                                    ...prev,
                                    plazaFrames: prev.plazaFrames.map((f) =>
                                      f.id === frame.id ? { ...f, title: e.target.value } : f
                                    ),
                                  }))
                                }
                                placeholder="Título"
                                className="h-9 rounded-xl border border-stone-800 bg-black/60 px-3 text-xs text-white outline-none focus:border-amber-500"
                              />
                              <input
                                type="number"
                                step="2"
                                value={frame.zOffset}
                                onChange={(e) =>
                                  setCmsData((prev) => ({
                                    ...prev,
                                    plazaFrames: prev.plazaFrames.map((f) =>
                                      f.id === frame.id
                                        ? { ...f, zOffset: Number(e.target.value) }
                                        : f
                                    ),
                                  }))
                                }
                                title="Posição Z na parede"
                                className="h-9 rounded-xl border border-stone-800 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>

                            <input
                              type="text"
                              value={frame.url}
                              onChange={(e) =>
                                setCmsData((prev) => ({
                                  ...prev,
                                  plazaFrames: prev.plazaFrames.map((f) =>
                                    f.id === frame.id ? { ...f, url: e.target.value } : f
                                  ),
                                }))
                              }
                              placeholder="URL do vídeo ou imagem..."
                              className="h-9 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-amber-600 hover:text-white">
                              {uploadingId === slotUploadId ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Upload className="size-3.5" />
                              )}
                              <span>
                                {uploadingId === slotUploadId ? "Enviando..." : "Enviar Mídia"}
                              </span>
                              <input
                                type="file"
                                accept="video/*,image/*"
                                className="hidden"
                                disabled={uploadingId === slotUploadId}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  void uploadMediaFile(file, slotUploadId, (url, detectedType) => ({
                                    ...cmsData,
                                    plazaFrames: cmsData.plazaFrames.map((f) =>
                                      f.id === frame.id
                                        ? { ...f, url, mediaType: detectedType }
                                        : f
                                    ),
                                  }))
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal Editor de LP HTML do Totem Interativo */}
      {editingTotem && (() => {
        const room = cmsData.galleries[editingTotem.galleryIndex]
        if (!room) return null
        const listKey = editingTotem.side === "left" ? "leftFrames" : "rightFrames"
        const frame = room[listKey].find((f) => f.id === editingTotem.frameId)
        if (!frame) return null

        const updateEditingFrame = (patch: Partial<MediaFrameItem>) => {
          updateGallery(editingTotem.galleryIndex, (r) => ({
            ...r,
            [listKey]: r[listKey].map((item) =>
              item.id === frame.id ? { ...item, ...patch } : item
            ),
          }))
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-stone-700 bg-stone-950 shadow-2xl">
              {/* Header do Modal */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 bg-stone-900/80 px-6 py-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    Totem Interativo · {room.title}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Landing Page HTML — {frame.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void persistCmsData(cmsData, `LP HTML do totem "${frame.title}" salva!`)
                      setEditingTotem(null)
                    }}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-amber-500"
                  >
                    <Save className="size-4" />
                    Salvar e Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTotem(null)}
                    className="rounded-xl border border-stone-700 bg-stone-900 p-2 text-stone-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Corpo dividido: Editor de Código HTML + Pré-visualização ao Vivo */}
              <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-2">
                <div className="flex flex-col space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-300">
                        Texto do botão no Totem 3D
                      </label>
                      <input
                        type="text"
                        value={frame.totemLabel ?? "Ver Projeto"}
                        onChange={(e) => updateEditingFrame({ totemLabel: e.target.value })}
                        placeholder="Ver Projeto"
                        className="h-10 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-300">
                        Ou URL Externa de Site (opcional)
                      </label>
                      <input
                        type="text"
                        value={frame.totemHtmlUrl ?? ""}
                        onChange={(e) => updateEditingFrame({ totemHtmlUrl: e.target.value })}
                        placeholder="https://meusite.com ou /uploads/lp.html"
                        className="h-10 w-full rounded-xl border border-stone-800 bg-black/60 px-3 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Código HTML da Landing Page (HTML + CSS + JS)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-600 hover:text-white">
                        <Upload className="size-3.5" />
                        <span>Carregar arquivo .HTML</span>
                        <input
                          type="file"
                          accept=".html,.htm,text/html"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const text = await file.text()
                            updateEditingFrame({ totemHtml: text })
                          }}
                        />
                      </label>

                      {frame.totemHtml && (
                        <button
                          type="button"
                          onClick={() => updateEditingFrame({ totemHtml: "" })}
                          className="rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-xs text-stone-400 hover:text-red-300"
                        >
                          Limpar HTML
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={frame.totemHtml ?? ""}
                    onChange={(e) => updateEditingFrame({ totemHtml: e.target.value })}
                    placeholder={`<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #111; color: #fff; font-family: sans-serif; padding: 40px; }\n  </style>\n</head>\n<body>\n  <h1>Minha Landing Page</h1>\n  <p>Cole aqui o código HTML completo do projeto...</p>\n</body>\n</html>`}
                    className="min-h-[340px] flex-1 resize-none rounded-2xl border border-stone-800 bg-black/80 p-4 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Live Preview da LP */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-300">
                      <Globe className="size-3.5 text-amber-400" />
                      Pré-visualização Interativa do Totem (role como site)
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-2xl border border-stone-800 bg-[#0d0b0c]">
                    {frame.totemHtml?.trim() ? (
                      <iframe
                        title="Preview LP HTML"
                        srcDoc={frame.totemHtml}
                        className="h-full min-h-[380px] w-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    ) : frame.totemHtmlUrl?.trim() ? (
                      <iframe
                        title="Preview URL"
                        src={frame.totemHtmlUrl}
                        className="h-full min-h-[380px] w-full border-0"
                      />
                    ) : (
                      <div className="flex h-full min-h-[380px] flex-col items-center justify-center p-8 text-center text-xs text-stone-500">
                        <FileCode2 className="mb-3 size-8 text-stone-700" />
                        <p>
                          Cole seu código HTML ao lado ou clique em &ldquo;Carregar arquivo .HTML&rdquo;
                          para visualizar a Landing Page funcionando em tempo real.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
