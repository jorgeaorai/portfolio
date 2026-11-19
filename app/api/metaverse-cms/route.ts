import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  getMetaverseCMSData,
  saveMetaverseCMSData,
  verifyAdminCredentials,
  verifyAdminToken,
} from "@/lib/db/metaverse-cms-store"
import { MetaverseCMSData } from "@/lib/types/metaverse-cms"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = getMetaverseCMSData()
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("x-admin-token")
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get("jaor_admin_token")?.value

    const body = await request.json()
    const isValidToken = verifyAdminToken(authHeader) || verifyAdminToken(cookieToken)
    const isValidInlineCreds = verifyAdminCredentials(body?.email, body?.password)

    if (!isValidToken && !isValidInlineCreds) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login como administrador." },
        { status: 401 }
      )
    }

    const cmsPayload: MetaverseCMSData = body.data ?? body
    const saved = saveMetaverseCMSData(cmsPayload)
    return NextResponse.json(saved)
  } catch (err: any) {
    console.error("Failed to save Metaverse CMS data:", err)
    return NextResponse.json(
      { error: err.message || "Falha ao salvar configurações" },
      { status: 500 }
    )
  }
}
