"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  date: string
  color: string
  isPinned: boolean
}

interface NoteEditorProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<Note, "id" | "date"> & { id?: string }) => void | Promise<void>
}

const colors = [
  { name: "white", class: "bg-card border-2" },
  { name: "yellow", class: "bg-amber-200" },
  { name: "green", class: "bg-emerald-200" },
  { name: "blue", class: "bg-sky-200" },
  { name: "pink", class: "bg-rose-200" },
]

export function NoteEditor({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedColor, setSelectedColor] = useState("white")

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSelectedColor(note.color)
    } else {
      setTitle("")
      setContent("")
      setSelectedColor("white")
    }
  }, [note, isOpen])

  const handleSave = async () => {
    try {
      await Promise.resolve(
        onSave({
          id: note?.id,
          title: title.trim(),
          content: content.trim(),
          color: selectedColor,
          isPinned: note?.isPinned || false,
        })
      )
      onClose()
    } catch {
      // 저장 실패 시 에러 메시지는 부모에서 표시, 다이얼로그는 유지
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{note ? "메모 수정" : "새 메모"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
          <Textarea
            placeholder="메모 내용을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none border-0 px-0 focus-visible:ring-0"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">색상:</span>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-7 h-7 rounded-full ${color.class} transition-transform ${
                    selectedColor === color.name
                      ? "ring-2 ring-primary ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
