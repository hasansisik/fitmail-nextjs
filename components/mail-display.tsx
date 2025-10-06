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
  Eye,
  ExternalLink,
  X,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2 as TrashIcon,
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
import { toast } from "sonner"
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
import { useState, useEffect, useRef } from "react"
import { useAppDispatch } from "@/redux/hook"
import { addReplyToMail, getMailById, toggleMailReadStatus } from "@/redux/actions/mailActions"
import { uploadFileToCloudinary } from "@/utils/cloudinary"

interface MailDisplayProps {
  mail: ApiMail | null
  isMaximized?: boolean
  onToggleMaximize?: () => void
  onMailSent?: () => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  file: File
  url?: string | null
}

export function MailDisplay({ mail, isMaximized = false, onToggleMaximize, onMailSent }: MailDisplayProps) {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const today = new Date()
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showConversation, setShowConversation] = useState(true) // Varsayılan olarak göster
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showTrashDialog, setShowTrashDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [replySent, setReplySent] = useState(false) // Cevap gönderildi mi?
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

  // Reply olup olmadığını kontrol et
  const isReply = mail?.subject?.toLowerCase().startsWith('re:') || false
  const originalSubject = isReply ? mail?.subject?.replace(/^re:\s*/i, '') : mail?.subject

  // Cevap gönderildikten sonra mail'i yeniden yükle
  useEffect(() => {
    if (replySent && mail?._id) {
      const reloadMail = async () => {
        try {
          await dispatch(getMailById(mail._id)).unwrap()
          setReplySent(false)
        } catch (error) {
          console.error("Failed to reload mail:", error)
        }
      }
      reloadMail()
    }
  }, [replySent, mail?._id, dispatch])

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Attachment ikonunu belirle
  const getAttachmentIcon = (attachment: any) => {
    const type = attachment.type || attachment.contentType || attachment.mimeType
    if (!type) return <Paperclip className="h-4 w-4" />
    
    // Resim dosyaları
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    
    // PDF dosyaları
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />
    
    // Word dosyaları
    if (type.includes('word') || type.includes('document') || type.includes('msword')) {
      return <FileText className="h-4 w-4" />
    }
    
    // Excel dosyaları
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('ms-excel')) {
      return <FileText className="h-4 w-4" />
    }
    
    // PowerPoint dosyaları
    if (type.includes('powerpoint') || type.includes('presentation') || type.includes('ms-powerpoint')) {
      return <FileText className="h-4 w-4" />
    }
    
    // Metin dosyaları
    if (type.startsWith('text/')) return <FileText className="h-4 w-4" />
    
    // Zip/Arşiv dosyaları
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar') || type.includes('gz')) {
      return <FileText className="h-4 w-4" />
    }
    
    // Varsayılan
    return <Paperclip className="h-4 w-4" />
  }

  // Dosya indirme
  const handleDownload = (attachment: any) => {
    if (attachment.url) {
      try {
        const link = document.createElement('a')
        link.href = attachment.url
        link.download = attachment.filename || attachment.name || 'attachment'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        
        // Link'i DOM'a ekle, tıkla ve kaldır
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Dosya indiriliyor...')
      } catch (error) {
        console.error('Download error:', error)
        toast.error('Dosya indirilemedi')
      }
    } else {
      toast.error('Dosya indirilemedi - URL bulunamadı')
    }
  }

  // Dosya preview
  const handlePreview = (attachment: any) => {
    if (attachment.url) {
      try {
        const type = attachment.type || attachment.contentType || attachment.mimeType
        
        // PDF ve resimler için doğrudan aç
        if (type?.includes('pdf') || type?.startsWith('image/')) {
          window.open(attachment.url, '_blank', 'noopener,noreferrer')
        } else {
          // Diğer dosyalar için yeni sekmede aç
          window.open(attachment.url, '_blank', 'noopener,noreferrer')
        }
        
        toast.success('Dosya açılıyor...')
      } catch (error) {
        console.error('Preview error:', error)
        toast.error('Dosya açılamadı')
      }
    } else {
      toast.error('Dosya önizlenemedi - URL bulunamadı')
    }
  }

  // Dosya türüne göre preview desteklenip desteklenmediğini kontrol et
  const canPreview = (attachment: any) => {
    const type = attachment.type || attachment.contentType || attachment.mimeType
    if (!type) return false
    return type.startsWith('image/') || 
           type.includes('pdf') || 
           type.includes('text/') ||
           type.includes('document') ||
           type.includes('word') ||
           type.includes('excel') ||
           type.includes('powerpoint') ||
           type.includes('presentation')
  }

  // Dosya seçme ve Cloudinary'ye yükleme
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setIsUploading(true)
      const fileArray = Array.from(files)
      
      try {
        const uploadPromises = fileArray.map(async (file) => {
          try {
            // Cloudinary'ye yükle
            const cloudinaryUrl = await uploadFileToCloudinary(file)
            
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              file: file,
              url: cloudinaryUrl // Cloudinary URL'sini ekle
            }
          } catch (error) {
            console.error('File upload error:', error)
            toast.error(`${file.name} yüklenemedi: ${error}`)
            
            // Hata durumunda sadece local file bilgisi
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              file: file,
              url: null
            }
          }
        })

        const newAttachments = await Promise.all(uploadPromises)
        setAttachments(prev => [...prev, ...newAttachments])
        
        const successCount = newAttachments.filter(att => att.url).length
        if (successCount > 0) {
          toast.success(`Dosya yüklendi`)
        }
      } catch (error) {
        console.error('Batch upload error:', error)
        toast.error('Dosyalar yüklenirken hata oluştu')
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Attachment silme
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  // Cevapla gönder
  const handleSendReply = async () => {
    if (!mail || !replyText.trim()) {
      toast.error("Cevap metni boş olamaz!")
      return
    }

    try {
      console.log("Sending reply to mail:", mail._id, "Content:", replyText)

      // Attachment'ları hazırla
      const attachmentsData = attachments.map(attachment => ({
        filename: attachment.name,
        data: attachment.file,
        contentType: attachment.type,
        size: attachment.size,
        url: attachment.url || undefined
      }));

      // Yeni cevap ekleme sistemi - orijinal maile cevap ekle
      const result = await dispatch(addReplyToMail({
        mailId: mail._id,
        content: replyText,
        attachments: attachmentsData.length > 0 ? attachmentsData : undefined
      })).unwrap()
      
      console.log("Reply added successfully:", result)
      toast.success("Cevap başarıyla gönderildi ve mail'e eklendi!")
      
      // Mail'i yeniden yükle
      setReplySent(true)
      
      // Callback ile parent component'e mail gönderildiğini bildir
      if (onMailSent) {
        onMailSent()
      }
      
      // Formu temizle
      setIsReplying(false)
      setReplyText("")
      setAttachments([])
      
    } catch (error: any) {
      console.error("Send reply failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "Cevap gönderilirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }

  // Okunmamış olarak işaretle
  const handleMarkAsUnread = async () => {
    if (!mail) return

    try {
      await dispatch(toggleMailReadStatus(mail._id)).unwrap()
      toast.success("Mail okunmamış olarak işaretlendi!")
      
      // Mail'i yeniden yükle
      await dispatch(getMailById(mail._id)).unwrap()
      
      // Parent component'i bilgilendir
      if (onMailSent) {
        onMailSent()
      }
    } catch (error: any) {
      console.error("Mark as unread failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "Mail işaretlenirken bir hata oluştu"
      toast.error(errorMessage)
    }
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

  // Cevapla
  const handleReply = () => {
    setIsReplying(true)
    setReplyText(`\n\n--- Orijinal Mesaj ---\n${mail?.content || mail?.htmlContent || ''}`)
  }

  // Cevapla Tümü
  const handleReplyAll = () => {
    setIsReplying(true)
    setReplyText(`\n\n--- Orijinal Mesaj ---\n${mail?.content || mail?.htmlContent || ''}`)
  }

  // İlet
  const handleForward = () => {
    setIsReplying(true)
    setReplyText(`\n\n--- İletilen Mesaj ---\nGönderen: ${mail?.from?.name || 'Bilinmeyen'} <${mail?.from?.email || 'Bilinmeyen'}>\nKonu: ${mail?.subject}\n\n${mail?.content || mail?.htmlContent || ''}`)
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
                  title="Geri"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Geri</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Geri</TooltipContent>
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
                onClick={handleReply}
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
            <DropdownMenuItem onClick={handleMarkAsUnread}>
              Okunmamış olarak işaretle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.to?.[0]?.name || 'Alıcı'} />
                <AvatarFallback>
                  {(mail.to?.[0]?.name || 'A')
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">Alıcı: {mail.to?.map(recipient => recipient.name).join(', ') || 'Bilinmeyen Alıcı'}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Gönderen:</span> {mail.from?.name || 'Bilinmeyen'} &lt;{mail.from?.email || 'Bilinmeyen'}&gt;
                </div>
              </div>
            </div>
            {(mail.receivedAt || mail.createdAt) && (
              <div className="ml-auto text-xs text-muted-foreground">
                {(() => {
                  try {
                    const dateValue = mail.receivedAt || mail.createdAt
                    if (!dateValue) return 'Tarih yok'
                    
                    const date = new Date(dateValue)
                    if (isNaN(date.getTime())) return 'Geçersiz tarih'
                    
                    // Detaylı zaman hesaplama
                    const now = new Date()
                    const diffInMs = now.getTime() - date.getTime()
                    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
                    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
                    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                    
                    if (diffInMinutes < 1) {
                      return 'Az önce'
                    } else if (diffInMinutes < 60) {
                      return `${diffInMinutes} dakika önce`
                    } else if (diffInHours < 24) {
                      return `${diffInHours} saat önce`
                    } else if (diffInDays < 7) {
                      return `${diffInDays} gün önce`
                    } else if (diffInDays < 30) {
                      const weeks = Math.floor(diffInDays / 7)
                      return `${weeks} hafta önce`
                    } else if (diffInDays < 365) {
                      const months = Math.floor(diffInDays / 30)
                      return `${months} ay önce`
                    } else {
                      const years = Math.floor(diffInDays / 365)
                      return `${years} yıl önce`
                    }
                  } catch (error) {
                    return 'Tarih hatası'
                  }
                })()}
              </div>
            )}
          </div>
          <Separator />
          {/* Reply için konuşma geçmişi */}
          {isReply && (
            <>
              <Separator />
              <div className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">↳ Yanıt</span>
                  <span className="text-xs text-muted-foreground">Orijinal konu: {originalSubject}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Bu mail, "{originalSubject}" konusundaki konuşmanın devamıdır.
                </div>
              </div>
            </>
          )}
          
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
                    <span className="text-xs text-muted-foreground">({mail.conversation.length} cevap)</span>
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
                              {(() => {
                                try {
                                  const date = new Date(message.date)
                                  if (isNaN(date.getTime())) return 'Geçersiz tarih'
                                  
                                  // Detaylı zaman hesaplama
                                  const now = new Date()
                                  const diffInMs = now.getTime() - date.getTime()
                                  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
                                  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
                                  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                                  
                                  if (diffInMinutes < 1) {
                                    return 'Az önce'
                                  } else if (diffInMinutes < 60) {
                                    return `${diffInMinutes} dakika önce`
                                  } else if (diffInHours < 24) {
                                    return `${diffInHours} saat önce`
                                  } else if (diffInDays < 7) {
                                    return `${diffInDays} gün önce`
                                  } else if (diffInDays < 30) {
                                    const weeks = Math.floor(diffInDays / 7)
                                    return `${weeks} hafta önce`
                                  } else if (diffInDays < 365) {
                                    const months = Math.floor(diffInDays / 30)
                                    return `${months} ay önce`
                                  } else {
                                    const years = Math.floor(diffInDays / 365)
                                    return `${years} yıl önce`
                                  }
                                } catch (error) {
                                  return 'Tarih hatası'
                                }
                              })()}
                            </span>
                            {message.isFromMe && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                Sen
                              </span>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  {mail.attachments.map((attachment, index) => (
                    <div
                      key={`attachment-${index}`}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {getAttachmentIcon(attachment)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.filename}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                          {attachment.url && (
                            <span className="text-xs text-green-600 font-medium">✓ İndirilebilir</span>
                          )}
                          {!attachment.url && (
                            <span className="text-xs text-orange-600 font-medium">⚠ URL yok</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {canPreview(attachment) && attachment.url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePreview(attachment)}
                            title="Önizle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {attachment.url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(attachment)}
                            title="İndir"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {!attachment.url && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            URL yok
                          </span>
                        )}
                      </div>
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
                  onClick={handleReply}
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
                  placeholder={`${mail.from?.name || 'Gönderen'} yanıtla...`}
                  className="min-h-[100px]"
                />
                
                {/* Yeni eklenen dosyalar */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Yeni Ekler:</span>
                    <div className="grid gap-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50"
                        >
                          {getAttachmentIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                              {attachment.url && (
                                <span className="text-xs text-green-600 font-medium">✓ Cloudinary'de</span>
                              )}
                              {!attachment.url && (
                                <span className="text-xs text-orange-600 font-medium">⚠ Yüklenemedi</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                      {isUploading ? 'Yükleniyor...' : 'Dosya Ekle'}
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
                      disabled={!replyText.trim() || isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isUploading ? 'Yükleniyor...' : 'Gönder'}
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
