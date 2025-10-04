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
  FolderOpen,
  Tag,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
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
  "Alışveriş",
  "Promosyon"
]

const moveToCategories = [
  "Spam",
  "Çöp",
  "Arşiv"
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
    e.stopPropagation()
    setOpen(true)
  }

  // Sol tık olaylarını engelle
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div onContextMenu={handleContextMenu} onClick={handleClick}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="flex flex-col">
          {/* Reply Actions */}
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("reply")}
          >
            <Reply className="mr-2 h-4 w-4" />
            Yanıtla
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("replyAll")}
          >
            <ReplyAll className="mr-2 h-4 w-4" />
            Tümünü yanıtla
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("forward")}
          >
            <Forward className="mr-2 h-4 w-4" />
            Yönlendir
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("forwardAsAttachment")}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Ek olarak yönlendir
          </Button>

          <div className="border-t my-1" />

          {/* Mail Actions */}
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("archive")}
          >
            <Archive className="mr-2 h-4 w-4" />
            Arşivle
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2 text-destructive hover:text-destructive"
            onClick={() => handleAction("delete")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("markAsRead")}
          >
            <MailOpen className="mr-2 h-4 w-4" />
            Okundu olarak işaretle
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleAction("snooze")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Ertele
          </Button>

          {/* Move Section */}
          <div className="px-2 py-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">Taşı</div>
            <div className="space-y-1">
              {filteredMoveCategories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="justify-start h-6 px-2 text-xs"
                  onClick={() => handleAction("move", { category })}
                >
                  <FolderOpen className="mr-2 h-3 w-3" />
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t my-1" />

          {/* Label Section */}
          <div className="px-2 py-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">Etiketle</div>
            <div className="space-y-1">
              {filteredLabels.map((label) => (
                <Button
                  key={label}
                  variant="ghost"
                  className="justify-start h-6 px-2 text-xs"
                  onClick={() => handleAction("toggleLabel", { label, checked: !mail.labels.includes(label) })}
                >
                  <Tag className="mr-2 h-3 w-3" />
                  {label}
                  {mail.labels.includes(label) && " ✓"}
                </Button>
              ))}
            </div>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  )
}
