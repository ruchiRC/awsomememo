"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MoreHorizontal, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NoteCardProps {
  id: string
  title: string
  content: string
  date: string
  color: string
  isPinned?: boolean
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onClick: (id: string) => void
}

const colorMap: Record<string, string> = {
  white: "bg-card",
  yellow: "bg-amber-50",
  green: "bg-emerald-50",
  blue: "bg-sky-50",
  pink: "bg-rose-50",
}

export function NoteCard({
  id,
  title,
  content,
  date,
  color,
  isPinned,
  onDelete,
  onPin,
  onClick,
}: NoteCardProps) {
  return (
    <Card
      className={`${colorMap[color] || colorMap.white} group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-border/50`}
      onClick={() => onClick(id)}
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground line-clamp-1 flex-1 text-balance">
          {title || "제목 없음"}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPinned && (
            <Pin className="h-4 w-4 text-primary fill-primary" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onPin(id)
                }}
              >
                {isPinned ? "고정 해제" : "상단에 고정"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(id)
                }}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {content || "내용 없음"}
        </p>
        <p className="text-xs text-muted-foreground/70">{date}</p>
      </CardContent>
    </Card>
  )
}
