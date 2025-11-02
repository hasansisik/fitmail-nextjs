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
  Star,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  scheduledSendAt?: string
  user: {
    _id: string
    name: string
    surname: string
    mailAddress: string
  }
}
import { useState, useEffect, useRef } from "react"
import { useAppDispatch } from "@/redux/hook"
import { addReplyToMail, getMailById, toggleMailReadStatus, moveMailToFolder, deleteMail, markMailAsStarred } from "@/redux/actions/mailActions"
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
  const [isDragging, setIsDragging] = useState(false)
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

  // Mail durumunu mail objesinden güncelle
  useEffect(() => {
    if (mail) {
      setMailStatus(prev => ({
        ...prev,
        isArchived: mail.folder === 'archive',
        isTrashed: mail.folder === 'trash',
        isStarred: mail.isStarred || false,
      }))
    }
  }, [mail])

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

  // URL'den dosya adını çıkar
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || ''
      // Query string'den dosya adını da kontrol et
      const urlParams = urlObj.searchParams.get('filename') || urlObj.searchParams.get('name')
      if (urlParams) {
        return decodeURIComponent(urlParams)
      }
      // Path'den dosya adını decode et
      return decodeURIComponent(fileName.split('?')[0])
    } catch {
      // URL parse edilemezse, basit string işlemi yap
      const parts = url.split('/')
      const lastPart = parts[parts.length - 1] || ''
      return decodeURIComponent(lastPart.split('?')[0].split('#')[0])
    }
  }

  // Dosya indirme - direkt indirme için fetch kullan
  const handleDownload = async (attachment: any) => {
    if (!attachment.url) {
      toast.error('Dosya indirilemedi - URL bulunamadı')
      return
    }

    try {
      const loadingToastId = toast.loading('Dosya indiriliyor...')
      
      // Fetch ile dosyayı blob olarak al
      const response = await fetch(attachment.url)
      if (!response.ok) {
        throw new Error('Dosya indirilemedi')
      }
      
      const blob = await response.blob()
      
      // Dosya adını belirle - öncelik sırasına göre
      let fileName = attachment.filename || attachment.originalName || attachment.name
      
      // Eğer hala dosya adı yoksa, URL'den çıkar
      if (!fileName || fileName === 'attachment' || fileName.trim() === '') {
        fileName = getFileNameFromUrl(attachment.url)
      }
      
      // Hala dosya adı yoksa, Content-Disposition header'ından almayı dene
      if (!fileName || fileName === 'attachment' || fileName.trim() === '') {
        const contentDisposition = response.headers.get('Content-Disposition')
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '')
            // UTF-8 encoded dosya adları için decode
            if (fileName.startsWith("UTF-8''")) {
              fileName = decodeURIComponent(fileName.replace("UTF-8''", ''))
            } else if (fileName.includes('%')) {
              fileName = decodeURIComponent(fileName)
            }
          }
        }
      }
      
      // Son çare olarak 'attachment' kullan
      if (!fileName || fileName.trim() === '') {
        // Blob tipinden uzantı çıkar
        const blobType = blob.type
        let extension = ''
        if (blobType) {
          const extMap: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'application/pdf': '.pdf',
            'application/zip': '.zip',
            'text/plain': '.txt'
          }
          extension = extMap[blobType] || ''
        }
        fileName = `attachment${extension}`
      }
      
      // Blob URL oluştur
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Link oluştur ve indir
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.style.display = 'none'
      
      // Link'i DOM'a ekle, tıkla ve kaldır
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Blob URL'yi temizle
      window.URL.revokeObjectURL(blobUrl)
      
      toast.dismiss(loadingToastId)
      toast.success('Dosya indirildi!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Dosya indirilemedi')
    }
  }

  // Dosya preview - güvenli modal ile
  const handlePreview = (attachment: any) => {  
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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if we're leaving the container itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Create a mock event object to reuse handleFileSelect logic
      const mockEvent = {
        target: {
          files: files
        }
      } as React.ChangeEvent<HTMLInputElement>
      
      await handleFileSelect(mockEvent)
    }
  }

  // Dosya seçme ve Cloudinary'ye yükleme
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setIsUploading(true)
      const fileArray = Array.from(files)
      
      // Dosya boyut limiti: 100MB = 100 * 1024 * 1024 bytes
      const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
      
      // Mevcut attachment'ların toplam boyutu
      const currentTotalSize = attachments.reduce((sum, att) => sum + att.size, 0)
      
      // Yeni dosyaların toplam boyutu
      const newFilesTotalSize = fileArray.reduce((sum, file) => sum + file.size, 0)
      
      // Toplam boyut kontrolü (mevcut + yeni dosyalar)
      const totalSize = currentTotalSize + newFilesTotalSize
      
      if (totalSize > MAX_FILE_SIZE) {
        toast.error(`Toplam dosya boyutu 100MB'ı geçemez! (Şu anki: ${formatFileSize(totalSize)}, Maksimum: ${formatFileSize(MAX_FILE_SIZE)})`)
        setIsUploading(false)
        // Input'u temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      
      // Her dosyanın tek başına 100MB'dan büyük olup olmadığını kontrol et
      const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        const oversizedNames = oversizedFiles.map(f => f.name).join(', ')
        toast.error(`Bazı dosyalar 100MB'dan büyük: ${oversizedNames}`)
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      
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
          toast.success(`${successCount} dosya başarıyla eklendi`)
        }
      } catch (error) {
        console.error('Batch upload error:', error)
        toast.error('Dosyalar yüklenirken hata oluştu')
      } finally {
        setIsUploading(false)
        // Input'u temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  // Attachment silme
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  // Direkt dosya seçiciyi aç
  const openFileChooser = () => {
    try {
      if (typeof window !== 'undefined' && fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture')
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
      
      toast.success("Cevap başarıyla gönderildi ve mail'e eklendi!")
      
      // Formu temizle
      setIsReplying(false)
      setReplyText("")
      setAttachments([])
      
      // Mail'i hemen yeniden yükle
      try {
        await dispatch(getMailById(mail._id)).unwrap()
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

  // Yıldızlama işlemi
  const handleStarred = async () => {
    if (!mail) return
    
    try {
      const result = await dispatch(markMailAsStarred(mail._id)).unwrap()
      const newStarredStatus = result.isStarred
      
      setMailStatus(prev => ({ ...prev, isStarred: newStarredStatus }))
      toast.success(newStarredStatus ? 'Mail yıldızlı olarak işaretlendi!' : 'Mail yıldızlı olmaktan çıkarıldı!')
      
      // Mail'i yeniden yükle
      await dispatch(getMailById(mail._id)).unwrap()
      
      // Parent component'i bilgilendir
      if (onMailSent) {
        onMailSent()
      }
    } catch (error: any) {
      console.error("Star failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "Yıldızlama sırasında bir hata oluştu"
      toast.error(errorMessage)
    }
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
  }

  // Erteleme iptal et
  const handleUnsnooze = () => {
    setMailStatus(prev => ({ 
      ...prev, 
      isSnoozed: false, 
      snoozeDate: undefined 
    }))
    setSelectedDate(undefined)
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
    <div 
      className={`flex h-full flex-col relative ${isDragging ? 'border-2 border-primary border-dashed' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-background p-6 rounded-lg shadow-lg border-2 border-primary">
            <Paperclip className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold text-center">Dosyaları buraya bırakın</p>
            <p className="text-sm text-muted-foreground text-center mt-2">Cevaba eklemek istediğiniz dosyaları sürükleyip bırakın</p>
          </div>
        </div>
      )}
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={!mail}
                onClick={handleStarred}
                className={mailStatus.isStarred ? "text-yellow-500" : ""}
              >
                <Star className={`h-4 w-4 ${mailStatus.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                <span className="sr-only">Yıldızla</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mailStatus.isStarred ? "Yıldız işaretini kaldır" : "Yıldızlı olarak işaretle"}</TooltipContent>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold">Alıcı: {mail.to?.map(recipient => recipient.name).join(', ') || 'Bilinmeyen Alıcı'}</div>
                  {mail.status === 'scheduled' && mail.scheduledSendAt && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Planlanan
                    </Badge>
                  )}
                </div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Gönderen:</span> {mail.from?.name || 'Bilinmeyen'} &lt;{mail.from?.email || 'Bilinmeyen'}&gt;
                </div>
              </div>
            </div>
            {(mail.receivedAt || mail.createdAt || (mail.status === 'scheduled' && mail.scheduledSendAt)) && (
              <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
                {(() => {
                  try {
                    // Planlanan mailler için scheduledSendAt tarihini göster
                    let dateValue = mail.status === 'scheduled' && mail.scheduledSendAt 
                      ? mail.scheduledSendAt 
                      : mail.receivedAt || mail.createdAt
                    
                    if (!dateValue) return 'Tarih yok'
                    
                    const date = new Date(dateValue)
                    if (isNaN(date.getTime())) return 'Geçersiz tarih'
                    
                    // Planlanan mail için farklı gösterim
                    if (mail.status === 'scheduled' && mail.scheduledSendAt) {
                      const now = new Date()
                      const diffInMs = date.getTime() - now.getTime()
                      
                      if (diffInMs < 0) {
                        return 'Geçmiş'
                      }
                      
                      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
                      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
                      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                      
                      if (diffInMinutes < 60) {
                        return `${diffInMinutes} dk sonra`
                      } else if (diffInHours < 24) {
                        return `${diffInHours} saat sonra`
                      } else if (diffInDays < 7) {
                        return `${diffInDays} gün sonra`
                      } else {
                        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      }
                    }
                    
                    // Normal mail için detaylı zaman hesaplama
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
          {/* Planlanan mail bilgisi */}
          {mail.status === 'scheduled' && mail.scheduledSendAt && (
            <>
              <Separator />
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Planlanan Mail</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Bu mail <strong>{new Date(mail.scheduledSendAt).toLocaleString('tr-TR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</strong> tarihinde gönderilecek.
                </div>
              </div>
            </>
          )}
          
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
            <div 
              className="prose prose-sm max-w-none p-2 sm:p-4 text-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:my-2 [&_h5]:text-base [&_h5]:font-bold [&_h5]:my-2 [&_h6]:text-sm [&_h6]:font-bold [&_h6]:my-2 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_p]:my-2"
              dangerouslySetInnerHTML={{ 
                __html: mail.htmlContent || mail.content || '<p>İçerik yok</p>' 
              }}
            />
          
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
                                {stripHtml(message.content).substring(0, 80)}
                                {stripHtml(message.content).length > 80 && '...'}
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
                                <div 
                                  className="text-sm prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_strong]:font-bold [&_em]:italic [&_u]:underline"
                                  dangerouslySetInnerHTML={{ __html: message.content }}
                                />
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
          <div 
            className={`border-t bg-background ${isDragging ? 'bg-primary/5' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
