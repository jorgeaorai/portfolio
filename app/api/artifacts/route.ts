import { NextResponse } from "next/server"
import { getAllArtifacts, saveArtifact, deleteArtifact } from "@/lib/db/artifacts-store"
import { MuseumArtifact } from "@/lib/types/artifact"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get("status")

  let list = getAllArtifacts()
  if (statusFilter) {
    list = list.filter((a) => a.status === statusFilter)
  }

  return NextResponse.json(list)
}

export async function POST(request: Request) {
  try {
    const body: Partial<MuseumArtifact> = await request.json()

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const artifact: MuseumArtifact = {
      id: body.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: body.title || "Untitled Artifact",
      description: body.description || "",
      author: body.author || "Unknown",
      historical_period: body.historical_period || "N/A",
      origin: body.origin || "N/A",
      material: body.material || "N/A",
      real_dimensions: body.real_dimensions || "",
      inventory_number: body.inventory_number || `INV-${Date.now().toString().slice(-6)}`,
      category: body.category || "Sculpture",
      model_url: body.model_url || "",
      cover_image_url: body.cover_image_url || "",
      audio_url: body.audio_url || "",
      position_x: body.position_x ?? 0,
      position_y: body.position_y ?? 1.4,
      position_z: body.position_z ?? 0,
      rotation_x: body.rotation_x ?? 0,
      rotation_y: body.rotation_y ?? 0,
      rotation_z: body.rotation_z ?? 0,
      scale_x: body.scale_x ?? 1,
      scale_y: body.scale_y ?? 1,
      scale_z: body.scale_z ?? 1,
      display_type: body.display_type || "pedestal",
      shadows_enabled: body.shadows_enabled ?? true,
      light_intensity: body.light_intensity ?? 4,
      status: body.status || "published",
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      triangle_count: body.triangle_count,
      material_count: body.material_count,
    }

    const saved = saveArtifact(artifact)
    return NextResponse.json(saved)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save artifact" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing artifact ID" }, { status: 400 })
  }

  const success = deleteArtifact(id)
  if (success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: "Artifact not found" }, { status: 404 })
}
