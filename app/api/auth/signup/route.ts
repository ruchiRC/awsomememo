import { NextResponse } from "next/server"
import { getDb } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const runtime = "nodejs"

const signupSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
  name: z.string().min(1, "이름을 입력해주세요.").optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const { email, password, name } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()

    const db = getDb()
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Signup error:", e)
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code?: string }).code)
        : ""
    const isUnreachable = code === "P1001"
    const message = isUnreachable
      ? "데이터베이스 서버에 연결할 수 없습니다. 네트워크·DATABASE_URL을 확인하세요."
      : "회원가입 처리 중 오류가 발생했습니다."
    const hint =
      isUnreachable
        ? "회사/학교 Wi‑Fi는 5432 포트를 막는 경우가 많습니다. Supabase → Connect → Session pooler의 URI로 .env의 DATABASE_URL을 바꿔 보세요. (docs/DATABASE.md)"
        : process.env.NODE_ENV === "development" && e instanceof Error
          ? e.message
          : undefined
    return NextResponse.json({ error: message, ...(hint && { hint }) }, { status: 500 })
  }
}
