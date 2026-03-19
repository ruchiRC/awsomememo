"use client"

import { StickyNote, Star, Trash2, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NoteSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  noteCounts: {
    all: number
    pinned: number
    trash: number
  }
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { id: "all", label: "모든 메모", icon: StickyNote },
  { id: "pinned", label: "고정됨", icon: Star },
  { id: "trash", label: "휴지통", icon: Trash2 },
]

export function NoteSidebar({
  activeView,
  onViewChange,
  noteCounts,
  isOpen,
  onToggle,
}: NoteSidebarProps) {
  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={onToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <StickyNote className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">메모</h1>
              <p className="text-xs text-muted-foreground">나의 생각을 기록</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const count =
              item.id === "all"
                ? noteCounts.all
                : item.id === "pinned"
                ? noteCounts.pinned
                : noteCounts.trash

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id)
                  if (window.innerWidth < 768) onToggle()
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  activeView === item.id
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    activeView === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 transition-colors">
            <Settings className="h-5 w-5" />
            <span>설정</span>
          </button>
        </div>
      </aside>
    </>
  )
}
