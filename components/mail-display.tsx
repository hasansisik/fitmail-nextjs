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
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
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
import { addReplyToMail, getMailById, toggleMailReadStatus, moveMailToFolder, deleteMail } from "@/redux/actions/mailActions"
import { uploadFileToCloudinary } from "@/utils/cloudinary"
import { AttachmentPreview } from "@/components/attachment-preview"
import { RichTextEditor } from "@/components/rich-text-editor"

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
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set()) // Genişletilmiş mesajlar
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showTrashDialog, setShowTrashDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [replySent, setReplySent] = useState(false) // Cevap gönderildi mi?
  const [previewAttachment, setPreviewAttachment] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
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

  // Dosya preview - güvenli modal ile
  const handlePreview = (attachment: any) => {
    console.log('=== PREVIEW CLICKED ===')
    console.log('Attachment object:', attachment)
    console.log('Attachment URL:', attachment.url)
    console.log('Attachment type:', attachment.type || attachment.contentType || attachment.mimeType)
    console.log('======================')
    
    setPreviewAttachment(attachment)
    setShowPreview(true)
  }

  // Preview modal'ı kapat
  const closePreview = () => {
    setShowPreview(false)
    setPreviewAttachment(null)
  }

  // Dosya türüne göre preview desteklenip desteklenmediğini kontrol et
  const canPreview = (attachment: any) => {
    // Tüm dosyalar için önizleme modalını aç (güvenlik kontrolü modal içinde yapılacak)
    return true
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

  // Mobilde kamera/dosya seçtirerek dosya seçiciyi aç
  const openFileChooser = () => {
    try {
      if (typeof window !== 'undefined' && fileInputRef.current) {
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isMobile) {
          const useCamera = window.confirm('Kamera ile fotoğraf çekmek ister misiniz? İptal: Dosyadan seç')
          if (useCamera) {
            fileInputRef.current.setAttribute('capture', 'environment')
          } else {
            fileInputRef.current.removeAttribute('capture')
          }
        } else {
          fileInputRef.current.removeAttribute('capture')
        }
        fileInputRef.current.click()
      }
    } catch (_) {
      fileInputRef.current?.removeAttribute('capture')
      fileInputRef.current?.click()
    }
  }

  // HTML'i düz metne çevir
  const stripHtml = (html: string) => {
    if (!html) return ''
    // HTML taglarını kaldır
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
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
      
      // Formu temizle
      setIsReplying(false)
      setReplyText("")
      setAttachments([])
      
      // Mail'i hemen yeniden yükle
      try {
        await dispatch(getMailById(mail._id)).unwrap()
        console.log("Mail reloaded successfully with updated conversation")
      } catch (reloadError) {
        console.error("Failed to reload mail:", reloadError)
      }
      
      // Callback ile parent component'e mail gönderildiğini bildir
      if (onMailSent) {
        onMailSent()
      }
      
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
  const confirmArchive = async () => {
    if (!mail) return
    
    try {
      const newFolder = mail.folder === 'archive' ? 'inbox' : 'archive'
      await dispatch(moveMailToFolder({ mailId: mail._id, folder: newFolder })).unwrap()
      
      toast.success(newFolder === 'archive' ? 'Mail arşivlendi!' : 'Mail gelen kutusuna taşındı!')
      setMailStatus(prev => ({ ...prev, isArchived: newFolder === 'archive' }))
      setShowArchiveDialog(false)
      
      // Parent component'i bilgilendir
      if (onMailSent) {
        onMailSent()
      }
      
      // Mail'i yeniden yükle
      await dispatch(getMailById(mail._id)).unwrap()
    } catch (error: any) {
      console.error("Archive failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "Arşivleme sırasında bir hata oluştu"
      toast.error(errorMessage)
      setShowArchiveDialog(false)
    }
  }

  // Çöp kutusu dialog'unu aç
  const handleTrash = () => {
    setShowTrashDialog(true)
  }

  // Çöp kutusu onayı
  const confirmTrash = async () => {
    if (!mail) return
    
    try {
      if (mail.folder === 'trash') {
        // Çöp kutusundan kalıcı olarak sil
        await dispatch(deleteMail(mail._id)).unwrap()
        toast.success('Mail kalıcı olarak silindi!')
        setShowTrashDialog(false)
        
        // Parent component'i bilgilendir
        if (onMailSent) {
          onMailSent()
        }
        
        // Mail silindiği için geri dön
        if (onToggleMaximize) {
          onToggleMaximize()
        }
      } else {
        // Çöp kutusuna taşı
        await dispatch(moveMailToFolder({ mailId: mail._id, folder: 'trash' })).unwrap()
        toast.success('Mail çöp kutusuna taşındı. 30 gün sonra otomatik olarak silinecek.')
        setMailStatus(prev => ({ ...prev, isTrashed: true }))
        setShowTrashDialog(false)
        
        // Parent component'i bilgilendir
        if (onMailSent) {
          onMailSent()
        }
        
        // Mail'i yeniden yükle
        await dispatch(getMailById(mail._id)).unwrap()
      }
    } catch (error: any) {
      console.error("Trash failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "Silme sırasında bir hata oluştu"
      toast.error(errorMessage)
      setShowTrashDialog(false)
    }
  }

  // Yıldızla
  const handleStar = () => {
    setMailStatus(prev => ({ ...prev, isStarred: !prev.isStarred }))
    console.log('Mail starred:', !mailStatus.isStarred)
  }

  // Cevapla
  const handleReply = () => {
    setIsReplying(true)
    // HTML formatında orijinal mesajı hazırla
    const originalContent = mail?.htmlContent || mail?.content || ''
    const formattedOriginal = `<p><br></p><p><br></p><p>--- Orijinal Mesaj ---</p><p>${originalContent.replace(/\n/g, '<br>')}</p>`
    setReplyText(formattedOriginal)
  }

  // Cevapla Tümü
  const handleReplyAll = () => {
    setIsReplying(true)
    // HTML formatında orijinal mesajı hazırla
    const originalContent = mail?.htmlContent || mail?.content || ''
    const formattedOriginal = `<p><br></p><p><br></p><p>--- Orijinal Mesaj ---</p><p>${originalContent.replace(/\n/g, '<br>')}</p>`
    setReplyText(formattedOriginal)
  }

  // İlet
  const handleForward = () => {
    setIsReplying(true)
    // HTML formatında iletilen mesajı hazırla
    const originalContent = mail?.htmlContent || mail?.content || ''
    const formattedForward = `<p><br></p><p><br></p><p>--- İletilen Mesaj ---</p><p>Gönderen: ${mail?.from?.name || 'Bilinmeyen'} &lt;${mail?.from?.email || 'Bilinmeyen'}&gt;</p><p>Konu: ${mail?.subject}</p><p><br></p><p>${originalContent.replace(/\n/g, '<br>')}</p>`
    setReplyText(formattedForward)
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

  // Mesaj genişletme/daraltma
  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-1 sm:gap-2">
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
                className={mailStatus.isArchived ? "bg-blue-100 text-purple-800" : ""}
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
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
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
        </div>
        <Separator orientation="vertical" className="mx-1 sm:mx-2 h-6" />
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
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-start p-2 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-4 text-sm">
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
              <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
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
                  <span className="text-sm font-medium text-purple-800 dark:text-blue-400">↳ Yanıt</span>
                  <span className="text-xs text-muted-foreground">Orijinal konu: {originalSubject}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Bu mail, "{originalSubject}" konusundaki konuşmanın devamıdır.
                </div>
              </div>
            </>
          )}
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="whitespace-pre-wrap p-2 sm:p-4 text-sm">
              {stripHtml(mail.content || mail.htmlContent || 'İçerik yok')}
            </div>
          
            {/* Karşılıklı Mesajlaşma */}
            {mail.conversation && mail.conversation.length > 0 && (
            <>
              <Separator />
              <div className="p-2 sm:p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Konuşma Geçmişi</span>
                  <span className="text-xs text-muted-foreground">({mail.conversation.length} cevap)</span>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mail.conversation.map((message, index) => {
                    const isExpanded = expandedMessages.has(message.id)
                    const isLastMessage = index === mail.conversation!.length - 1
                    
                    return (
                      <div
                        key={message.id}
                        className={`border rounded-lg transition-all ${
                          message.isFromMe 
                            ? "bg-purple-200/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900" 
                            : "bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        {/* Daraltılmış görünüm - 3 nokta ile */}
                        {!isExpanded && (
                          <div
                            onClick={() => toggleMessageExpansion(message.id)}
                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 p-3 pb-2">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="text-xs">
                                  {message.sender.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{message.sender}</span>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {(() => {
                                      try {
                                        const date = new Date(message.date)
                                        if (isNaN(date.getTime())) return 'Geçersiz tarih'
                                        
                                        const now = new Date()
                                        const diffInMs = now.getTime() - date.getTime()
                                        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
                                        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
                                        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                                        
                                        if (diffInMinutes < 1) return 'Az önce'
                                        else if (diffInMinutes < 60) return `${diffInMinutes}d`
                                        else if (diffInHours < 24) return `${diffInHours}s`
                                        else if (diffInDays < 7) return `${diffInDays}g`
                                        else if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}h`
                                        else if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}a`
                                        else return `${Math.floor(diffInDays / 365)}y`
                                      } catch (error) {
                                        return ''
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                            {/* 3 nokta - ortada */}
                            <div className="flex items-center  py-1 px-3">
                              <MoreHorizontal className="h-5 w-5 text-muted-foreground/60" />
                            </div>
                            {/* Mesaj önizlemesi */}
                            <div className="px-3 pb-3">
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {stripHtml(message.content).substring(0, 80)}...
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Genişletilmiş görünüm */}
                        {isExpanded && (
                          <div className="p-3">
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="text-xs">
                                  {message.sender.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{message.sender}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {(() => {
                                        try {
                                          const date = new Date(message.date)
                                          if (isNaN(date.getTime())) return 'Geçersiz tarih'
                                          
                                          const now = new Date()
                                          const diffInMs = now.getTime() - date.getTime()
                                          const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
                                          const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
                                          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                                          
                                          if (diffInMinutes < 1) return 'Az önce'
                                          else if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
                                          else if (diffInHours < 24) return `${diffInHours} saat önce`
                                          else if (diffInDays < 7) return `${diffInDays} gün önce`
                                          else if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`
                                          else if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`
                                          else return `${Math.floor(diffInDays / 365)} yıl önce`
                                        } catch (error) {
                                          return 'Tarih hatası'
                                        }
                                      })()}
                                    </span>
                                    {message.isFromMe && (
                                      <span className="text-xs bg-blue-100 text-purple-800 px-2 py-0.5 rounded">
                                        Sen
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleMessageExpansion(message.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{stripHtml(message.content)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              </>
            )}
          
            {/* Attachments */}
            {mail.attachments && mail.attachments.length > 0 && (
            <>
              <Separator />
              <div className="p-2 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Ekler ({mail.attachments.length})</span>
                </div>
                <div className="grid gap-2">
                  {mail.attachments.map((attachment, index) => {
                    // Dosya tipini belirle
                    const type = attachment.type || attachment.contentType || attachment.mimeType || ""
                    let detectedType = type
                    if (!detectedType || detectedType === "") {
                      const extension = attachment.filename?.toLowerCase().split('.').pop() || ''
                      if (['jpg', 'jpeg'].includes(extension)) detectedType = 'image/jpeg'
                      else if (extension === 'png') detectedType = 'image/png'
                      else if (extension === 'gif') detectedType = 'image/gif'
                      else if (extension === 'webp') detectedType = 'image/webp'
                    }
                    const isImage = detectedType.startsWith('image/')

                    return (
                      <div
                        key={`attachment-${index}`}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {/* Resim önizlemesi veya ikon */}
                        {isImage && attachment.url ? (
                          <div className="relative flex-shrink-0">
                            <img
                              src={attachment.url}
                              alt={attachment.filename}
                              className="w-16 h-16 object-cover rounded border"
                              loading="lazy"
                              onError={(e) => {
                                // Resim yüklenemezse ikona geri dön
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const iconContainer = target.nextElementSibling as HTMLElement
                                if (iconContainer) {
                                  iconContainer.style.display = 'flex'
                                }
                              }}
                            />
                            <div className="hidden items-center justify-center w-16 h-16">
                              {getAttachmentIcon(attachment)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center flex-shrink-0">
                            {getAttachmentIcon(attachment)}
                          </div>
                        )}
                        
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
                          {attachment.url && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePreview(attachment)}
                              title="Güvenli Önizleme"
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
                    )
                  })}
                </div>
              </div>
              </>
            )}
          </div>
          
          {/* Fixed footer - Gmail benzeri cevapla kısmı */}
          <div className="border-t bg-background">
            <div className="p-2 sm:p-4">
            {!isReplying ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleReply}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Reply className="h-4 w-4" />
                  <span className="hidden sm:inline">Cevapla</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleReplyAll}
                >
                  <ReplyAll className="h-4 w-4" />
                  <span className="hidden sm:inline">Cevapla Tümü</span>
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
                
                <RichTextEditor
                  content={replyText}
                  onChange={(content) => setReplyText(content)}
                  placeholder={`${mail.from?.name || 'Gönderen'}'a yanıt yazın...`}
                />
                
                {/* Yeni eklenen dosyalar */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Yeni Ekler:</span>
                    <div className="grid gap-2">
                      {attachments.map((attachment) => {
                        const isImage = attachment.type.startsWith('image/')
                        
                        return (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50"
                          >
                            {/* Resim önizlemesi veya ikon */}
                            {isImage && attachment.url ? (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="w-12 h-12 object-cover rounded border"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const iconContainer = target.nextElementSibling as HTMLElement
                                    if (iconContainer) {
                                      iconContainer.style.display = 'flex'
                                    }
                                  }}
                                />
                                <div className="hidden items-center justify-center w-12 h-12">
                                  {getAttachmentIcon(attachment.type)}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center flex-shrink-0">
                                {getAttachmentIcon(attachment.type)}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                                {attachment.url && (
                                  <span className="text-xs text-green-600 font-medium">✓ Yüklendi</span>
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
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openFileChooser}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{isUploading ? 'Yükleniyor...' : 'Dosya Ekle'}</span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
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
              {mail?.folder === 'archive' ? "Arşivden Çıkar" : "Arşivle"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mail?.folder === 'archive'
                ? "Bu maili arşivden çıkarmak istediğinizden emin misiniz? Mail gelen kutusuna geri dönecektir."
                : "Bu maili arşivlemek istediğinizden emin misiniz? Mail arşiv klasörüne taşınacaktır."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              {mail?.folder === 'archive' ? "Arşivden Çıkar" : "Arşivle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Çöp Kutusu Onay Dialog'u */}
      <AlertDialog open={showTrashDialog} onOpenChange={setShowTrashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mail?.folder === 'trash' ? "Kalıcı Olarak Sil" : "Çöp Kutusuna Taşı"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mail?.folder === 'trash'
                ? "Bu maili kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                : "Bu maili çöp kutusuna taşımak istediğinizden emin misiniz? Mail 30 gün sonra otomatik olarak silinecektir."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmTrash}
              className={mail?.folder === 'trash' ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {mail?.folder === 'trash' ? "Kalıcı Olarak Sil" : "Çöp Kutusuna Taşı"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ek Önizleme Modal'ı */}
      <AttachmentPreview
        attachment={previewAttachment}
        isOpen={showPreview}
        onClose={closePreview}
        onDownload={() => {
          if (previewAttachment) {
            handleDownload(previewAttachment)
          }
        }}
      />

    </div>
  )
}
