"use client"

import * as React from "react"
import {
  Reply,
  ReplyAll,
  Forward,
  Paperclip,
  Archive,
  Trash2,
  MailOpen,
  Clock,
  CheckCircle,
  FolderOpen,
  Tag,
  VolumeX,
  ChevronRight,
  Search,
  Plus,
  Edit,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Mail } from "@/app/dashboard/mail/data"

interface MailContextMenuProps {
  children: React.ReactNode
  mail: Mail
  onAction: (action: string, mailId: string, data?: any) => void
}

const predefinedLabels = [
  "Sosyal",
  "Güncellemeler", 
  "Forumlar",
  "Tanıtımlar",
  "Spam",
  "Çöp Kutusu"
]

const moveToCategories = [
  "Sosyal",
  "Güncellemeler",
  "Forumlar", 
  "Tanıtımlar",
  "Spam",
  "Çöp Kutusu"
]

export function MailContextMenu({ children, mail, onAction }: MailContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [labelSearch, setLabelSearch] = React.useState("")
  const [moveSearch, setMoveSearch] = React.useState("")

  const handleAction = (action: string, data?: any) => {
    onAction(action, mail.id, data)
    setOpen(false)
  }

  const filteredLabels = predefinedLabels.filter(label =>
    label.toLowerCase().includes(labelSearch.toLowerCase())
  )

  const filteredMoveCategories = moveToCategories.filter(category =>
    category.toLowerCase().includes(moveSearch.toLowerCase())
  )

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset search when closing
      setLabelSearch("")
      setMoveSearch("")
    }
  }

  // Sağ tık ile menüyü aç
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(true)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>
      <DropdownMenuContent className="w-56" align="start">
        {/* Reply Actions */}
        <DropdownMenuItem onClick={() => handleAction("reply")}>
          <Reply className="mr-2 h-4 w-4" />
          Yanıtla
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("replyAll")}>
          <ReplyAll className="mr-2 h-4 w-4" />
          Tümünü yanıtla
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("forward")}>
          <Forward className="mr-2 h-4 w-4" />
          Yönlendir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("forwardAsAttachment")}>
          <Paperclip className="mr-2 h-4 w-4" />
          Ek olarak yönlendir
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Mail Actions */}
        <DropdownMenuItem onClick={() => handleAction("archive")}>
          <Archive className="mr-2 h-4 w-4" />
          Arşivle
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleAction("delete")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Sil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("markAsRead")}>
          <MailOpen className="mr-2 h-4 w-4" />
          Okundu olarak işaretle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("snooze")}>
          <Clock className="mr-2 h-4 w-4" />
          Ertele
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("addToTasks")}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Görevler'e ekle
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Move Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderOpen className="mr-2 h-4 w-4" />
            Taşı
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuLabel>Şuraya taşı:</DropdownMenuLabel>
            <div className="px-2 py-1">
              <div className="relative">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ara..."
                  value={moveSearch}
                  onChange={(e) => setMoveSearch(e.target.value)}
                  className="h-8 pr-8"
                />
              </div>
            </div>
            {filteredMoveCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleAction("move", { category })}
              >
                {category}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction("createNewCategory")}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni oluştur
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("editCategories")}>
              <Edit className="mr-2 h-4 w-4" />
              Etiketleri düzenle
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Label Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag className="mr-2 h-4 w-4" />
            Etiketle
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuLabel>Şu etiketi uygula:</DropdownMenuLabel>
            <div className="px-2 py-1">
              <div className="relative">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ara..."
                  value={labelSearch}
                  onChange={(e) => setLabelSearch(e.target.value)}
                  className="h-8 pr-8"
                />
              </div>
            </div>
            {filteredLabels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label}
                checked={mail.labels.includes(label)}
                onCheckedChange={(checked) => 
                  handleAction("toggleLabel", { label, checked })
                }
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction("createNewLabel")}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni oluştur
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("editLabels")}>
              <Edit className="mr-2 h-4 w-4" />
              Etiketleri düzenle
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Mute */}
        <DropdownMenuItem onClick={() => handleAction("mute")}>
          <VolumeX className="mr-2 h-4 w-4" />
          Sessize Al
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
