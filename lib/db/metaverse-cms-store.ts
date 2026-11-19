import fs from "fs"
import path from "path"
import { createDefaultMetaverseCMSData, MetaverseCMSData } from "@/lib/types/metaverse-cms"

const CMS_DB_FILE = path.join(process.cwd(), "lib", "data", "metaverse-cms.json")

export const ADMIN_EMAIL = "jorgeaorf@gmail.com"
export const ADMIN_TOKEN_VALUE = "jaor_admin_session_240113"

export function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === "Jaor240113"
}

export function verifyAdminToken(token?: string | null): boolean {
  return token === ADMIN_TOKEN_VALUE
}

function ensureCmsFile() {
  const dir = path.dirname(CMS_DB_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(CMS_DB_FILE)) {
    const initial = createDefaultMetaverseCMSData()
    fs.writeFileSync(CMS_DB_FILE, JSON.stringify(initial, null, 2), "utf-8")
  }
}

export function getMetaverseCMSData(): MetaverseCMSData {
  ensureCmsFile()
  try {
    const raw = fs.readFileSync(CMS_DB_FILE, "utf-8")
    const parsed = JSON.parse(raw) as Partial<MetaverseCMSData>
    const defaults = createDefaultMetaverseCMSData()
    return {
      stage: { ...defaults.stage, ...(parsed.stage || {}) },
      galleries: Array.isArray(parsed.galleries) && parsed.galleries.length > 0 ? parsed.galleries : defaults.galleries,
      plazaFrames: Array.isArray(parsed.plazaFrames) ? parsed.plazaFrames : defaults.plazaFrames,
      updatedAt: parsed.updatedAt || defaults.updatedAt,
    }
  } catch (error) {
    console.error("Failed to read metaverse-cms.json, returning defaults:", error)
    return createDefaultMetaverseCMSData()
  }
}

export function saveMetaverseCMSData(data: MetaverseCMSData): MetaverseCMSData {
  ensureCmsFile()
  const updated: MetaverseCMSData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(CMS_DB_FILE, JSON.stringify(updated, null, 2), "utf-8")
  return updated
}
