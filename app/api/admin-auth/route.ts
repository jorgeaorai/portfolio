import { NextResponse } from "next/server"
import { ADMIN_EMAIL, ADMIN_TOKEN_VALUE, verifyAdminCredentials } from "@/lib/db/metaverse-cms-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body || {}

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: "Acesso negado. E-mail ou senha inválidos." },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      authenticated: true,
      email: ADMIN_EMAIL,
      token: ADMIN_TOKEN_VALUE,
    })

    response.cookies.set("jaor_admin_token", ADMIN_TOKEN_VALUE, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro na autenticação" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.delete("jaor_admin_token")
  return response
}
