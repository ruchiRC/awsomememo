import { NextResponse } from "next/server"
import { getDb } from "@/lib/prisma"

export const runtime = "nodejs"

/** 브라우저에서 열어 Supabase 연결 여부 확인 (회원가입/로그인 실패 시) */
export async function GET() {
  try {
    const db = getDb()
    const userCount = await db.user.count()
    return NextResponse.json({
      ok: true,
      message: "데이터베이스 연결 정상",
      userCount,
    })
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code?: string }).code)
        : ""
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      {
        ok: false,
        code: code || undefined,
        message: msg,
        hint:
          code === "P1001"
            ? "Supabase 호스트(보통 5432)에 연결되지 않습니다. 회사/학교 Wi‑Fi 차단 가능성이 큽니다. Supabase Connect → Session pooler URI로 DATABASE_URL 변경을 시도하세요. docs/DATABASE.md"
            : "DATABASE_URL·.env·서버 터미널 로그를 확인하세요.",
      },
      { status: 503 }
    )
  }
}
