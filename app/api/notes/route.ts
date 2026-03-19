import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/prisma"

export const runtime = "nodejs"

function formatNote(n: { id: string; title: string; content: string; updatedAt: Date; color: string; isPinned: boolean; isDeleted: boolean }) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    date: new Date(n.updatedAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    color: n.color,
    isPinned: n.isPinned,
    isDeleted: n.isDeleted,
  }
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const url = new URL(request.url)
  const view = url.searchParams.get("view")

  const where: { userId: string; isDeleted?: boolean; isPinned?: boolean } = {
    userId: session.user.id,
  }
  if (view === "trash") {
    where.isDeleted = true
  } else if (view === "pinned") {
    where.isDeleted = false
    where.isPinned = true
  }

  try {
    const db = await getDb()
    const notes = await db.note.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    })
    return NextResponse.json(notes.map(formatNote))
  } catch (e) {
    console.error("Notes GET error:", e)
    return NextResponse.json(
      { error: "메모 목록을 불러오지 못했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (e) {
    console.error("POST body parse error:", e)
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    )
  }

  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {}
  const title = typeof payload.title === "string" ? payload.title : ""
  const content = typeof payload.content === "string" ? payload.content : ""
  const color = typeof payload.color === "string" ? payload.color : "white"
  const isPinned = Boolean(payload.isPinned)

  try {
    const db = await getDb()
    const note = await db.note.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        content: content.trim(),
        color,
        isPinned,
      },
    })
    return NextResponse.json(formatNote(note))
  } catch (e) {
    console.error("Note create error:", e)
    const message = e instanceof Error ? e.message : "메모 저장에 실패했습니다."
    const isDev = process.env.NODE_ENV === "development"
    return NextResponse.json(
      { error: isDev ? message : "메모 저장에 실패했습니다." },
      { status: 500 }
    )
  }
}
