"use client"

import { useState, useEffect, useCallback } from "react"
import { signOut } from "next-auth/react"
import { Plus, Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NoteCard } from "@/components/note-card"
import { NoteEditor } from "@/components/note-editor"
import { NoteSidebar } from "@/components/note-sidebar"

interface Note {
  id: string
  title: string
  content: string
  date: string
  color: string
  isPinned: boolean
  isDeleted: boolean
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState("all")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setNotes(data)
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeView === "all") return !note.isDeleted && matchesSearch
    if (activeView === "pinned")
      return !note.isDeleted && note.isPinned && matchesSearch
    if (activeView === "trash") return note.isDeleted && matchesSearch
    return matchesSearch
  })

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned && !n.isDeleted)
  const otherNotes = filteredNotes.filter((n) => !n.isPinned || n.isDeleted)

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isDeleted: true } : n)))
    } catch {
      // ignore
    }
  }

  const handlePin = async (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      })
      if (res.ok) {
        const updated = await res.json()
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
      }
    } catch {
      // ignore
    }
  }

  const handleNoteClick = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setSelectedNote(note)
      setIsEditorOpen(true)
    }
  }

  const handleSave = async (
    noteData: Omit<Note, "id" | "date" | "isDeleted"> & { id?: string }
  ) => {
    try {
      if (noteData.id) {
        const res = await fetch(`/api/notes/${noteData.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteData.title,
            content: noteData.content,
            color: noteData.color,
            isPinned: noteData.isPinned,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error ?? "메모 수정에 실패했습니다.")
        }
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteData.title ?? "",
            content: noteData.content ?? "",
            color: noteData.color ?? "white",
            isPinned: noteData.isPinned ?? false,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error ?? "메모 저장에 실패했습니다.")
        }
      }
      await fetchNotes()
    } catch (e) {
      console.error("Save note error:", e)
      alert(e instanceof Error ? e.message : "메모 저장 중 오류가 발생했습니다.")
      throw e
    }
    setSelectedNote(null)
  }

  const noteCounts = {
    all: notes.filter((n) => !n.isDeleted).length,
    pinned: notes.filter((n) => n.isPinned && !n.isDeleted).length,
    trash: notes.filter((n) => n.isDeleted).length,
  }

  const getViewTitle = () => {
    switch (activeView) {
      case "pinned":
        return "고정된 메모"
      case "trash":
        return "휴지통"
      default:
        return "모든 메모"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">메모를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <NoteSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        noteCounts={noteCounts}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 md:ml-0 ml-12">
              <h2 className="text-2xl font-bold text-foreground">
                {getViewTitle()}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredNotes.length}개의 메모
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="메모 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              {activeView !== "trash" && (
                <Button
                  onClick={() => {
                    setSelectedNote(null)
                    setIsEditorOpen(true)
                  }}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">새 메모</span>
                </Button>
              )}
              <Button
                variant="outline"
                className="shrink-0"
                onClick={async () => {
                  await signOut({ redirect: false })
                  window.location.href = "/login"
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "검색 결과가 없습니다" : "메모가 없습니다"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {searchQuery
                  ? "다른 검색어로 시도해보세요"
                  : "새 메모 버튼을 눌러 첫 번째 메모를 작성해보세요"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pinnedNotes.length > 0 && activeView !== "trash" && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    고정됨
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        {...note}
                        onDelete={handleDelete}
                        onPin={handlePin}
                        onClick={handleNoteClick}
                      />
                    ))}
                  </div>
                </section>
              )}

              {otherNotes.length > 0 && (
                <section>
                  {pinnedNotes.length > 0 && activeView !== "trash" && (
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                      기타
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {otherNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        {...note}
                        onDelete={handleDelete}
                        onPin={handlePin}
                        onClick={handleNoteClick}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <NoteEditor
        note={selectedNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setSelectedNote(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}
