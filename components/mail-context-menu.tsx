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
  Star,
  AlertCircle,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppDispatch } from "@/redux/hook"
import { 
  moveMailToCategory, 
  removeMailFromCategory,
  toggleMailReadStatus,
  moveMailToFolder,
  deleteMail,
  markMailAsImportant,
  markMailAsStarred,
  snoozeMail
} from "@/redux/actions/mailActions"
import { toast } from "sonner"

// API'den gelen mail formatı
interface ApiMail {
  _id: string
  from: {
    name: string
    email: string
  }
  to: Array<{ name: string; email: string }>
  cc: Array<{ name: string; email: string }>
  bcc: Array<{ name: string; email: string }>
  subject: string
  content: string
  htmlContent?: string
  attachments: Array<{
    filename: string
    originalName?: string
    mimeType?: string
    contentType?: string
    type?: string
    size: number
    url?: string
  }>
  labels: string[]
  categories: string[]
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  receivedAt: string
  createdAt: string
  updatedAt: string
  conversation?: Array<{
    id: string
    sender: string
    content: string
    date: string
    isFromMe: boolean
  }>
  status: string
  mailgunId: string
  messageId: string
  references: string[]
  user: {
    _id: string
    name: string
    surname: string
    mailAddress: string
  }
}

interface MailContextMenuProps {
  children: React.ReactNode
  mail: ApiMail
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
  const dispatch = useAppDispatch()
  const [open, setOpen] = React.useState(false)
  const [labelSearch, setLabelSearch] = React.useState("")
  const [moveSearch, setMoveSearch] = React.useState("")
  const [menuPosition, setMenuPosition] = React.useState<{ x: number; y: number } | null>(null)
  const [menuSide, setMenuSide] = React.useState<"top" | "bottom">("bottom")

  const handleAction = (action: string, data?: any) => {
    onAction(action, mail._id, data)
    setOpen(false)
  }

  const handleCategoryAction = async (action: string, category: string) => {
    try {
      if (action === 'add') {
        await dispatch(moveMailToCategory({ mailId: mail._id, category })).unwrap()
        toast.success(`Mail ${category} kategorisine eklendi`)
        // Parent component'e bildir
        handleAction('toggleLabel', { category, action: 'add' })
      } else if (action === 'remove') {
        await dispatch(removeMailFromCategory({ mailId: mail._id, category })).unwrap()
        toast.success(`Mail ${category} kategorisinden çıkarıldı`)
        // Parent component'e bildir
        handleAction('toggleLabel', { category, action: 'remove' })
      }
    } catch (error) {
      console.error('Kategori işlemi başarısız:', error)
      toast.error('Kategori işlemi başarısız')
    }
    setOpen(false)
  }

  const handleMailAction = async (action: string, data?: any) => {
    try {
      switch (action) {
        case 'reply':
          toast.info('Yanıtla özelliği yakında eklenecek')
          break
        case 'replyAll':
          toast.info('Tümünü yanıtla özelliği yakında eklenecek')
          break
        case 'forward':
          toast.info('Yönlendir özelliği yakında eklenecek')
          break
        case 'forwardAsAttachment':
          toast.info('Ek olarak yönlendir özelliği yakında eklenecek')
          break
        case 'archive':
          await dispatch(moveMailToFolder({ mailId: mail._id, folder: 'archive' })).unwrap()
          toast.success('Mail arşivlendi')
          // Parent component'e bildir
          handleAction(action, data)
          break
        case 'delete':
          await dispatch(deleteMail(mail._id)).unwrap()
          toast.success('Mail silindi')
          // Parent component'e bildir
          handleAction(action, data)
          break
        case 'markAsRead':
          await dispatch(toggleMailReadStatus(mail._id)).unwrap()
          toast.success(mail.isRead ? 'Mail okunmadı olarak işaretlendi' : 'Mail okundu olarak işaretlendi')
          // Parent component'e bildir
          handleAction(action, data)
          break
        case 'snooze':
          // 1 saat sonra için ertele
          const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString()
          await dispatch(snoozeMail({ mailId: mail._id, snoozeUntil })).unwrap()
          toast.success('Mail 1 saat sonra için ertelendi')
          // Parent component'e bildir
          handleAction(action, data)
          break
        case 'move':
          if (data?.category) {
            const folderMap: Record<string, string> = {
              'Spam': 'spam',
              'Çöp': 'trash',
              'Arşiv': 'archive'
            }
            const folder = folderMap[data.category]
            if (folder) {
              await dispatch(moveMailToFolder({ mailId: mail._id, folder })).unwrap()
              toast.success(`Mail ${data.category} klasörüne taşındı`)
              // Parent component'e bildir
              handleAction(action, data)
            }
          }
          break
        case 'markAsImportant':
          await dispatch(markMailAsImportant(mail._id)).unwrap()
          toast.success(mail.isImportant ? 'Mail önemli işareti kaldırıldı' : 'Mail önemli olarak işaretlendi')
          // Parent component'e bildir
          handleAction(action, data)
          break
        case 'markAsStarred':
          await dispatch(markMailAsStarred(mail._id)).unwrap()
          toast.success(mail.isStarred ? 'Mail yıldız işareti kaldırıldı' : 'Mail yıldızlı olarak işaretlendi')
          // Parent component'e bildir
          handleAction(action, data)
          break
        default:
      }
    } catch (error) {
      console.error('Mail işlemi başarısız:', error)
      toast.error('İşlem başarısız')
    }
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
      setMenuPosition(null)
      setMenuSide("bottom")
    }
  }

  // Sağ tık ile menüyü aç
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Mouse pozisyonunu kaydet
    const mouseY = e.clientY
    const windowHeight = window.innerHeight
    
    // Eğer mouse ekranın alt yarısındaysa menüyü yukarı aç
    const shouldOpenUp = mouseY > windowHeight / 2
    
    setMenuPosition({ x: e.clientX, y: mouseY })
    setMenuSide(shouldOpenUp ? "top" : "bottom")
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
      <PopoverContent 
        className="w-56 p-0 max-h-96" 
        align="start" 
        side={menuSide}
        sideOffset={5}
        alignOffset={0}
        avoidCollisions={true}
        collisionPadding={50}
        sticky="always"
        hideWhenDetached={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col max-h-96 overflow-y-auto">
          {/* Reply Actions */}
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("reply")}
          >
            <Reply className="mr-2 h-4 w-4" />
            Yanıtla
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("replyAll")}
          >
            <ReplyAll className="mr-2 h-4 w-4" />
            Tümünü yanıtla
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("forward")}
          >
            <Forward className="mr-2 h-4 w-4" />
            Yönlendir
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("forwardAsAttachment")}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Ek olarak yönlendir
          </Button>

          <div className="border-t my-1" />

          {/* Mail Actions */}
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("archive")}
          >
            <Archive className="mr-2 h-4 w-4" />
            Arşivle
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2 text-destructive hover:text-destructive"
            onClick={() => handleMailAction("delete")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("markAsRead")}
          >
            <MailOpen className="mr-2 h-4 w-4" />
            {mail.isRead ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}
          </Button>
         
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("markAsImportant")}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {mail.isImportant ? 'Önemli işaretini kaldır' : 'Önemli olarak işaretle'}
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-8 px-2"
            onClick={() => handleMailAction("markAsStarred")}
          >
            <Star className={`mr-2 h-4 w-4 ${mail.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {mail.isStarred ? 'Yıldız işaretini kaldır' : 'Yıldızlı olarak işaretle'}
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
                  onClick={() => handleMailAction("move", { category })}
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
                  {filteredLabels.map((label) => {
                    const categoryMap: Record<string, string> = {
                      "Sosyal": "social",
                      "Güncellemeler": "updates", 
                      "Forumlar": "forums",
                      "Alışveriş": "shopping",
                      "Promosyon": "promotions"
                    }
                    const categoryKey = categoryMap[label]
                    const isInCategory = mail.categories?.includes(categoryKey) || mail.labels.includes(categoryKey)
                    
                    return (
                      <Button
                        key={label}
                        variant="ghost"
                        className="justify-start h-6 px-2 text-xs"
                        onClick={() => handleCategoryAction(isInCategory ? 'remove' : 'add', categoryKey)}
                      >
                        <Tag className="mr-2 h-3 w-3" />
                        {label}
                        {isInCategory && " ✓"}
                      </Button>
                    )
                  })}
            </div>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  )
}
