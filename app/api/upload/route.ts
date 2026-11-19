import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { validateGlbBuffer } from "@/lib/db/artifacts-store"

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB (suporta vídeos em alta resolução)

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg", ".ogv"])

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const fileType = formData.get("type") as string | null // 'glb' | 'cover' | 'audio' | 'media'

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de 500 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB)` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name).toLowerCase()

    // Security Validation for GLB
    if (fileType === "glb" || ext === ".glb") {
      if (ext !== ".glb") {
        return NextResponse.json({ error: "Only .glb file extensions are allowed for 3D models." }, { status: 400 })
      }

      const validation = validateGlbBuffer(buffer)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error || "Invalid GLB file" }, { status: 400 })
      }
    }

    // Security & File Name Normalization
    const sanitizedFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "_")
      .replace(/_+/g, "_")
    const filename = `${Date.now()}_${sanitizedFilename}`

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${filename}`
    const detectedMediaType =
      file.type.startsWith("video/") || VIDEO_EXTENSIONS.has(ext) ? "video" : "image"

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      mediaType: detectedMediaType,
    })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: err.message || "Falha ao enviar arquivo" }, { status: 500 })
  }
}
