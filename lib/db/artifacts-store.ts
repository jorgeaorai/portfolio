import fs from "fs"
import path from "path"
import { MuseumArtifact } from "@/lib/types/artifact"

const DATA_DIR = path.join(process.cwd(), "public", "uploads")
const DB_FILE = path.join(process.cwd(), "lib", "data", "artifacts.json")

// Initial fallback/default artifacts
const DEFAULT_ARTIFACTS: MuseumArtifact[] = [
  {
    id: "default-1",
    title: "Kinetic Aurora",
    description: "A continuous topological knot with no beginning and no end, symbolizing the perpetual flow of time and memory.",
    author: "Helena Vasquez",
    historical_period: "Contemporary (2021)",
    origin: "Spain",
    material: "Polished bronze",
    real_dimensions: "1.2m x 1.2m x 1.4m",
    inventory_number: "ART-2021-001",
    category: "Sculpture",
    model_url: "", // procedural fallback if empty
    position_x: -5.2,
    position_y: 1.4,
    position_z: -16,
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
]

function ensureStorageDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const dbDir = path.dirname(DB_FILE)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2))
  }
}

export function getAllArtifacts(): MuseumArtifact[] {
  ensureStorageDir()
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading artifacts DB:", error)
    return []
  }
}

export function saveArtifact(artifact: MuseumArtifact): MuseumArtifact {
  ensureStorageDir()
  const artifacts = getAllArtifacts()
  const index = artifacts.findIndex((a) => a.id === artifact.id)

  if (index >= 0) {
    artifacts[index] = { ...artifact, updated_at: new Date().toISOString() }
  } else {
    artifacts.push(artifact)
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(artifacts, null, 2))
  return artifact
}

export function deleteArtifact(id: string): boolean {
  ensureStorageDir()
  const artifacts = getAllArtifacts()
  const filtered = artifacts.filter((a) => a.id !== id)
  if (filtered.length !== artifacts.length) {
    fs.writeFileSync(DB_FILE, JSON.stringify(filtered, null, 2))
    return true
  }
  return false
}

export function validateGlbBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  // Check minimum GLB header length (12 bytes)
  if (buffer.length < 12) {
    return { valid: false, error: "File is too small to be a valid GLB container." }
  }

  // Check GLB magic number 'glTF' (0x46546C67 in Little Endian)
  const magic = buffer.readUInt32LE(0)
  if (magic !== 0x46546c67) {
    return { valid: false, error: "Invalid binary GLB signature. Magic header does not match 'glTF'." }
  }

  // Check version (should be 2)
  const version = buffer.readUInt32LE(4)
  if (version !== 2) {
    return { valid: false, error: `Unsupported GLB version: ${version}. Only GLB v2 is supported.` }
  }

  return { valid: true }
}
