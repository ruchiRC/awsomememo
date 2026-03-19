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

async function getNote(id: string, userId: string) {
  const db = await getDb()
  return db.note.findFirst({
    where: { id, userId },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const existing = await getNote(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "메모를 찾을 수 없습니다." }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }
  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {}
  const data: { title?: string; content?: string; color?: string; isPinned?: boolean; isDeleted?: boolean } = {}
  if (typeof payload.title === "string") data.title = payload.title.trim()
  if (typeof payload.content === "string") data.content = payload.content.trim()
  if (typeof payload.color === "string") data.color = payload.color
  if (typeof payload.isPinned === "boolean") data.isPinned = payload.isPinned
  if (typeof payload.isDeleted === "boolean") data.isDeleted = payload.isDeleted

  try {
    const db = await getDb()
    const note = await db.note.update({
      where: { id },
      data,
    })
    return NextResponse.json(formatNote(note))
  } catch (e) {
    console.error("Note update error:", e)
    return NextResponse.json(
      { error: "메모 수정에 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const existing = await getNote(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "메모를 찾을 수 없습니다." }, { status: 404 })
  }

  const db = await getDb()
  await db.note.update({
    where: { id },
    data: { isDeleted: true },
  })
  return NextResponse.json({ success: true })
}
