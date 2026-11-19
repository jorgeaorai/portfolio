"use client"

import React, { useState, useEffect } from "react"
import { MuseumArtifact, DisplayType, ArtifactStatus } from "@/lib/types/artifact"
import { ExhibitionEditor3D } from "./exhibition-editor-3d"
import {
  Upload,
  Box,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertTriangle,
  Move,
  RotateCw,
  Maximize,
  ArrowLeft,
  Volume2,
  FileCode,
  Image as ImageIcon
} from "lucide-react"

export default function AdminAcervoPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [authError, setAuthError] = useState("")

  const [artifacts, setArtifacts] = useState<MuseumArtifact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeArtifact, setActiveArtifact] = useState<Partial<MuseumArtifact>>({})

  // File Upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [modelStats, setModelStats] = useState<{ triangles?: number; materials?: number; warning?: string }>({})

  // 3D Transform Mode: translate | rotate | scale
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate")

  useEffect(() => {
    fetchArtifacts()
  }, [])

  const fetchArtifacts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/artifacts")
      if (res.ok) {
        const data = await res.json()
        setArtifacts(data)
      }
    } catch (err) {
      console.error("Error fetching artifacts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple admin validation demo (default passcode: admin123 or admin)
    if (passcode === "admin" || passcode === "admin123" || passcode === "123456") {
      setIsAuthenticated(true)
      setAuthError("")
    } else {
      setAuthError("Invalid admin passcode. Try 'admin'.")
    }
  }

  const startNewArtifact = () => {
    setActiveArtifact({
      title: "",
      description: "",
      author: "",
      historical_period: "",
      origin: "",
      material: "",
      real_dimensions: "",
      inventory_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      category: "Sculpture",
      model_url: "",
      cover_image_url: "",
      audio_url: "",
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
    })
    setModelStats({})
    setUploadError("")
    setIsEditing(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "glb" | "cover" | "audio") => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    setUploadProgress(10)

    // Security & Client-Side File Checks
    if (type === "glb") {
      if (!file.name.toLowerCase().endsWith(".glb")) {
        setUploadError("Security error: Only binary .glb 3D files are supported.")
        setUploadProgress(null)
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        setUploadError("File size exceeds 100 MB limit.")
        setUploadProgress(null)
        return
      }
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      setUploadProgress(40)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      setUploadProgress(80)

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadProgress(100)
      setTimeout(() => setUploadProgress(null), 800)

      if (type === "glb") {
        setActiveArtifact((prev) => ({ ...prev, model_url: data.url }))
      } else if (type === "cover") {
        setActiveArtifact((prev) => ({ ...prev, cover_image_url: data.url }))
      } else if (type === "audio") {
        setActiveArtifact((prev) => ({ ...prev, audio_url: data.url }))
      }
    } catch (err: any) {
      setUploadError(err.message || "File upload error")
      setUploadProgress(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeArtifact.title) {
      alert("Please provide a title for the piece.")
      return
    }

    try {
      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeArtifact,
          triangle_count: modelStats.triangles,
          material_count: modelStats.materials,
        }),
      })

      if (res.ok) {
        await fetchArtifacts()
        setIsEditing(false)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to save artifact")
      }
    } catch (error) {
      alert("Error connecting to server")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this piece from the museum catalog?")) return

    try {
      const res = await fetch(`/api/artifacts?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchArtifacts()
      }
    } catch (error) {
      alert("Error deleting artifact")
    }
  }

  const toggleStatus = async (artifact: MuseumArtifact) => {
    const nextStatus: ArtifactStatus =
      artifact.status === "published" ? "hidden" : "published"
    try {
      await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...artifact, status: nextStatus }),
      })
      fetchArtifacts()
    } catch (err) {
      console.error(err)
    }
  }

  // Render Login Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121215] p-4 text-foreground">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Box className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Museum Administration</h1>
            <p className="text-sm text-muted-foreground">Enter admin passcode to manage the 3D collection.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (default: admin)"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {authError && <p className="mt-2 text-xs text-destructive">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121215] text-card-foreground p-6 flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/60 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">3D Museum Catalog & Exhibition Manager</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Upload digitalized GLB models, edit position/rotation/scale, and manage gallery exhibits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-4 py-2 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Museum
          </a>
          {!isEditing && (
            <button
              onClick={startNewArtifact}
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Upload New 3D Piece
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Form Controls Sidebar (Left Column) */}
          <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back to list
              </button>
              <span className="text-xs font-mono px-2.5 py-1 bg-secondary rounded text-muted-foreground">
                {activeArtifact.id ? `Editing ID: ${activeArtifact.id}` : "New Entry"}
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-5 bg-card border border-border rounded-xl p-5 shadow-lg">
              {/* File Upload Sections */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  1. 3D GLB Model File
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors bg-background/50">
                  <input
                    type="file"
                    accept=".glb"
                    onChange={(e) => handleFileUpload(e, "glb")}
                    className="hidden"
                    id="glb-upload"
                  />
                  <label htmlFor="glb-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <FileCode className="h-8 w-8 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      {activeArtifact.model_url ? "Click to replace GLB model" : "Upload .GLB file (LiDAR / Photogrammetry)"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Binary GLB format, Max 100 MB</span>
                  </label>
                </div>

                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {uploadError && <p className="text-xs text-destructive font-medium">{uploadError}</p>}

                {/* Model Polygon Statistics & Warning */}
                {modelStats.triangles !== undefined && (
                  <div className="rounded-lg bg-secondary/50 p-3 border border-border text-xs space-y-1">
                    <div className="flex justify-between font-mono">
                      <span>Polygons (Triangles):</span>
                      <span className="font-bold">{modelStats.triangles.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Materials:</span>
                      <span className="font-bold">{modelStats.materials}</span>
                    </div>
                    {modelStats.warning && (
                      <div className="mt-2 text-amber-400 flex items-start gap-1.5 text-[11px]">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{modelStats.warning}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cover & Audio uploads */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "cover")}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-secondary file:text-xs text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Audio Description</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, "audio")}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-secondary file:text-xs text-muted-foreground"
                  />
                </div>
              </div>

              {/* Form Metadata */}
              <div className="space-y-4 pt-2 border-t border-border/60">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  2. Piece Metadata
                </label>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={activeArtifact.title || ""}
                    onChange={(e) => setActiveArtifact({ ...activeArtifact, title: e.target.value })}
                    placeholder="e.g. Venus de Milo Copy"
                    className="w-full px-3 py-2 rounded border border-border bg-background text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={activeArtifact.description || ""}
                    onChange={(e) => setActiveArtifact({ ...activeArtifact, description: e.target.value })}
                    placeholder="History, context, and artistic analysis..."
                    className="w-full px-3 py-2 rounded border border-border bg-background text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Author / Creator</label>
                    <input
                      type="text"
                      value={activeArtifact.author || ""}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, author: e.target.value })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Historical Period</label>
                    <input
                      type="text"
                      value={activeArtifact.historical_period || ""}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, historical_period: e.target.value })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Material</label>
                    <input
                      type="text"
                      value={activeArtifact.material || ""}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, material: e.target.value })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Dimensions (Real)</label>
                    <input
                      type="text"
                      value={activeArtifact.real_dimensions || ""}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, real_dimensions: e.target.value })}
                      placeholder="e.g. 1.8m x 0.6m"
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Inventory Number</label>
                    <input
                      type="text"
                      value={activeArtifact.inventory_number || ""}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, inventory_number: e.target.value })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Display Type</label>
                    <select
                      value={activeArtifact.display_type || "pedestal"}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, display_type: e.target.value as DisplayType })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    >
                      <option value="pedestal">Pedestal</option>
                      <option value="wall">Wall</option>
                      <option value="showcase">Showcase</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Light Intensity</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={activeArtifact.light_intensity ?? 4}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, light_intensity: parseFloat(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Status</label>
                    <select
                      value={activeArtifact.status || "published"}
                      onChange={(e) => setActiveArtifact({ ...activeArtifact, status: e.target.value as ArtifactStatus })}
                      className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" /> Save Piece & Publish
              </button>
            </form>
          </div>

          {/* 3D Exhibition Editor Canvas (Right Column) */}
          <div className="lg:col-span-7 flex flex-col space-y-3 h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Transform Tool:</span>
                <button
                  type="button"
                  onClick={() => setTransformMode("translate")}
                  className={`px-3 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                    transformMode === "translate" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Move className="h-3.5 w-3.5" /> Move (G)
                </button>
                <button
                  type="button"
                  onClick={() => setTransformMode("rotate")}
                  className={`px-3 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                    transformMode === "rotate" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <RotateCw className="h-3.5 w-3.5" /> Rotate (R)
                </button>
                <button
                  type="button"
                  onClick={() => setTransformMode("scale")}
                  className={`px-3 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                    transformMode === "scale" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Maximize className="h-3.5 w-3.5" /> Scale (S)
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground font-mono">
                X: {activeArtifact.position_x} | Y: {activeArtifact.position_y} | Z: {activeArtifact.position_z}
              </div>
            </div>

            <div className="flex-1">
              <ExhibitionEditor3D
                artifact={activeArtifact}
                transformMode={transformMode}
                onTransformChange={({ position, rotation, scale }) => {
                  setActiveArtifact((prev) => ({
                    ...prev,
                    position_x: position[0],
                    position_y: position[1],
                    position_z: position[2],
                    rotation_x: rotation[0],
                    rotation_y: rotation[1],
                    rotation_z: rotation[2],
                    scale_x: scale[0],
                    scale_y: scale[1],
                    scale_z: scale[2],
                  }))
                }}
                onModelAnalyzed={(stats) => setModelStats(stats)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Catalog List view */
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Total Catalog Items: {artifacts.length}</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading catalog...</div>
          ) : artifacts.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card/40 space-y-3">
              <Box className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">No 3D pieces in the catalog yet.</p>
              <button
                onClick={startNewArtifact}
                className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg"
              >
                Upload First 3D Model (.GLB)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((art) => (
                <div key={art.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base text-card-foreground leading-snug">{art.title}</h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                          art.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {art.author || "Unknown Author"} · {art.historical_period || "N/A"}
                    </p>
                    <p className="text-xs text-card-foreground/70 mt-2 line-clamp-2">{art.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground font-mono">
                      <span className="bg-secondary px-2 py-0.5 rounded">Display: {art.display_type}</span>
                      <span className="bg-secondary px-2 py-0.5 rounded">Inv: {art.inventory_number}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <button
                      onClick={() => toggleStatus(art)}
                      className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                    >
                      {art.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {art.status === "published" ? "Hide" : "Publish"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveArtifact(art)
                          setIsEditing(true)
                        }}
                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-white transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 hover:bg-destructive/20 rounded text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
