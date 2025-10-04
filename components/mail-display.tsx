import { addDays } from "date-fns/addDays"
import { addHours } from "date-fns/addHours"
import { format } from "date-fns/format"
import { nextSaturday } from "date-fns/nextSaturday"
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
  Maximize2,
  Minimize2,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
  Send,
  X,
} from "lucide-react"

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  labels: string[]
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  receivedAt: string
  createdAt: string
  updatedAt: string
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
import { useState } from "react"

interface MailDisplayProps {
  mail: ApiMail | null
  isMaximized?: boolean
  onToggleMaximize?: () => void
}

export function MailDisplay({ mail, isMaximized = false, onToggleMaximize }: MailDisplayProps) {
  const today = new Date()
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [showConversation, setShowConversation] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showTrashDialog, setShowTrashDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [mailStatus, setMailStatus] = useState<{
    isArchived: boolean
    isTrashed: boolean
    isStarred: boolean
    isSnoozed: boolean
    snoozeDate?: string
  }>({
    isArchived: false,
    isTrashed: false,
    isStarred: false,
    isSnoozed: false
  })

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Attachment ikonunu belirle
  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />
    return <Paperclip className="h-4 w-4" />
  }

  // Dosya ekleme
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  // Attachment silme
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Cevapla gönder
  const handleSendReply = () => {
    // Burada gerçek gönderme işlemi yapılacak
    console.log('Reply:', replyText)
    console.log('Attachments:', attachments)
    setIsReplying(false)
    setReplyText("")
    setAttachments([])
  }

  // Arşivle dialog'unu aç
  const handleArchive = () => {
    setShowArchiveDialog(true)
  }

  // Arşivle onayı
  const confirmArchive = () => {
    setMailStatus(prev => ({ ...prev, isArchived: !prev.isArchived }))
    console.log('Mail archived:', !mailStatus.isArchived)
    setShowArchiveDialog(false)
  }

  // Çöp kutusu dialog'unu aç
  const handleTrash = () => {
    setShowTrashDialog(true)
  }

  // Çöp kutusu onayı
  const confirmTrash = () => {
    setMailStatus(prev => ({ ...prev, isTrashed: !prev.isTrashed }))
    console.log('Mail trashed:', !mailStatus.isTrashed)
    setShowTrashDialog(false)
  }

  // Yıldızla
  const handleStar = () => {
    setMailStatus(prev => ({ ...prev, isStarred: !prev.isStarred }))
    console.log('Mail starred:', !mailStatus.isStarred)
  }

  // Cevapla Tümü
  const handleReplyAll = () => {
    setIsReplying(true)
    setReplyText(`\n\n--- Orijinal Mesaj ---\n${mail?.text}`)
  }

  // İlet
  const handleForward = () => {
    setIsReplying(true)
    setReplyText(`\n\n--- İletilen Mesaj ---\nGönderen: ${mail?.name} <${mail?.email}>\nKonu: ${mail?.subject}\n\n${mail?.text}`)
  }

  // Erteleme fonksiyonları
  const handleSnooze = (snoozeDate: Date, label: string) => {
    setMailStatus(prev => ({ 
      ...prev, 
      isSnoozed: true, 
      snoozeDate: snoozeDate.toISOString() 
    }))
    console.log(`Mail snoozed until ${label}:`, snoozeDate)
  }

  // Erteleme iptal et
  const handleUnsnooze = () => {
    setMailStatus(prev => ({ 
      ...prev, 
      isSnoozed: false, 
      snoozeDate: undefined 
    }))
    setSelectedDate(undefined)
    console.log('Mail unsnoozed')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          {onToggleMaximize && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onToggleMaximize}
                  title={isMaximized ? "Küçült" : "Büyüt"}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">{isMaximized ? "Küçült" : "Büyüt"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMaximized ? "Küçült" : "Büyüt"}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={!mail}
                onClick={handleArchive}
                className={mailStatus.isArchived ? "bg-blue-100 text-blue-600" : ""}
              >
                <Archive className="h-4 w-4" />
                <span className="sr-only">Arşivle</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mailStatus.isArchived ? "Arşivden çıkar" : "Arşivle"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={!mail}
                onClick={handleTrash}
                className={mailStatus.isTrashed ? "bg-red-100 text-red-600" : ""}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Sil</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mailStatus.isTrashed ? "Çöp kutusundan çıkar" : "Çöp kutusuna taşı"}</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={!mail}
                    className={mailStatus.isSnoozed ? "bg-orange-100 text-orange-600" : ""}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Ertle</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Şu zamana kadar ertle</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze(addHours(today, 4), "Bugün daha sonra")}
                    >
                      Bugün daha sonra{" "}
                      <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze(addDays(today, 1), "Yarın")}
                    >
                      Yarın
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze(nextSaturday(today), "Bu hafta sonu")}
                    >
                      Bu hafta sonu
                      <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze(addDays(today, 7), "Gelecek hafta")}
                    >
                      Gelecek hafta
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), "E, h:m b")}
                      </span>
                    </Button>
                    {mailStatus.isSnoozed && (
                      <Button
                        variant="ghost"
                        className="justify-start font-normal text-red-600 hover:text-red-700"
                        onClick={handleUnsnooze}
                      >
                        Ertelemeyi iptal et
                        <span className="ml-auto text-muted-foreground">
                          {mailStatus.snoozeDate && format(new Date(mailStatus.snoozeDate), "E, h:m b")}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date)
                        handleSnooze(date, format(date, "E, MMM d, yyyy"))
                      }
                    }}
                    disabled={(date) => date < today}
                    initialFocus
                  />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>
              {mailStatus.isSnoozed 
                ? `Ertelendi: ${mailStatus.snoozeDate ? format(new Date(mailStatus.snoozeDate), "E, h:m b") : ""}` 
                : "Ertle"
              }
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={!mail}
                onClick={() => setIsReplying(true)}
              >
                <Reply className="h-4 w-4" />
                <span className="sr-only">Yanıtla</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Yanıtla</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={!mail}
                onClick={handleReplyAll}
              >
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Hepsine yanıtla</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hepsine yanıtla</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={!mail}
                onClick={handleForward}
              >
                <Forward className="h-4 w-4" />
                <span className="sr-only">İlet</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>İlet</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Daha fazla</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Okunmamış olarak işaretle</DropdownMenuItem>
            <DropdownMenuItem>Konuyu yıldızla</DropdownMenuItem>
            <DropdownMenuItem>Etiket ekle</DropdownMenuItem>
            <DropdownMenuItem>Konuyu sustur</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.from?.name || 'Gönderen'} />
                <AvatarFallback>
                  {(mail.from?.name || 'G')
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.from?.name || 'Bilinmeyen Gönderen'}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Yanıt-Adresi:</span> {mail.from?.email || 'Bilinmeyen'}
                </div>
              </div>
            </div>
            {(mail.receivedAt || mail.createdAt) && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.receivedAt || mail.createdAt), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {mail.content || mail.htmlContent || 'İçerik yok'}
          </div>
          
          {/* Karşılıklı Mesajlaşma */}
          {mail.conversation && mail.conversation.length > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Konuşma Geçmişi</span>
                    <span className="text-xs text-muted-foreground">({mail.conversation.length} mesaj)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConversation(!showConversation)}
                    className="text-xs"
                  >
                    {showConversation ? "Gizle" : "Göster"}
                  </Button>
                </div>
                
                {showConversation && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {mail.conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 p-3 rounded-lg ${
                          message.isFromMe 
                            ? "bg-blue-50 dark:bg-blue-950/20 ml-8" 
                            : "bg-gray-50 dark:bg-gray-900/50 mr-8"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.sender.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.sender}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.date), "HH:mm")}
                            </span>
                            {message.isFromMe && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                Sen
                              </span>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Attachments */}
          {mail.attachments && mail.attachments.length > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Ekler ({mail.attachments.length})</span>
                </div>
                <div className="grid gap-2">
                  {mail.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {getAttachmentIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator className="mt-auto" />
          
          {/* Gmail benzeri cevapla kısmı */}
          <div className="p-4">
            {!isReplying ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsReplying(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Reply className="h-4 w-4" />
                  Cevapla
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleReplyAll}
                >
                  <ReplyAll className="h-4 w-4" />
                  Cevapla Tümü
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleForward}
                >
                  <Forward className="h-4 w-4" />
                  İlet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yanıtla</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`${mail.name} yanıtla...`}
                  className="min-h-[100px]"
                />
                
                {/* Yeni eklenen dosyalar */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Yeni Ekler:</span>
                    <div className="grid gap-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50"
                        >
                          {getAttachmentIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      Dosya Ekle
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="mute"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
                      <Switch id="mute" aria-label="Konuyu sustur" />
                      Bu konuyu sustur
                    </Label>
                    <Button
                      onClick={handleSendReply}
                      size="sm"
                      disabled={!replyText.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          Hiç mesaj seçilmedi
        </div>
      )}
      
      {/* Arşivle Onay Dialog'u */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mailStatus.isArchived ? "Arşivden Çıkar" : "Arşivle"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mailStatus.isArchived 
                ? "Bu maili arşivden çıkarmak istediğinizden emin misiniz? Mail gelen kutusuna geri dönecektir."
                : "Bu maili arşivlemek istediğinizden emin misiniz? Mail arşiv klasörüne taşınacaktır."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              {mailStatus.isArchived ? "Arşivden Çıkar" : "Arşivle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Çöp Kutusu Onay Dialog'u */}
      <AlertDialog open={showTrashDialog} onOpenChange={setShowTrashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mailStatus.isTrashed ? "Çöp Kutusundan Çıkar" : "Çöp Kutusuna Taşı"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mailStatus.isTrashed 
                ? "Bu maili çöp kutusundan çıkarmak istediğinizden emin misiniz? Mail gelen kutusuna geri dönecektir."
                : "Bu maili çöp kutusuna taşımak istediğinizden emin misiniz? Mail çöp kutusu klasörüne taşınacaktır."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTrash}>
              {mailStatus.isTrashed ? "Çöp Kutusundan Çıkar" : "Çöp Kutusuna Taşı"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
