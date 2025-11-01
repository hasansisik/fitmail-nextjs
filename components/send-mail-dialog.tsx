"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Switch } from "@/components/ui/switch"
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppDispatch } from "@/redux/hook"
import { sendMail, saveDraft, scheduleMail } from "@/redux/actions/mailActions"
import { uploadFileToCloudinary } from "@/utils/cloudinary"
import { toast } from "sonner"
import {
  Loader2,
  Send,
  X,
  Paperclip,
  FileText,
  Trash2,
  Info,
  Clock,
  ChevronDown
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SendMailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  replyMode?: 'reply' | 'replyAll' | 'forward' | null
  originalMail?: any
  draftMail?: any
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

// localStorage key for saving form state
const COMPOSE_DIALOG_STORAGE_KEY = 'composeDialogState'

// Helper functions to save/load form state
const saveFormStateToStorage = (state: any) => {
  try {
    localStorage.setItem(COMPOSE_DIALOG_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save form state:', e)
  }
}

const loadFormStateFromStorage = () => {
  try {
    const stored = localStorage.getItem(COMPOSE_DIALOG_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load form state:', e)
  }
  return null
}

const clearFormStateFromStorage = () => {
  try {
    localStorage.removeItem(COMPOSE_DIALOG_STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear form state:', e)
  }
}

export function SendMailDialog({ open, onOpenChange, replyMode = null, originalMail = null, draftMail = null, onMailSent }: SendMailDialogProps) {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Internal dialog state - route değişikliklerinden etkilenmez
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // localStorage'dan yüklenmiş mi kontrolü (sadece bir kez yükle)
  const hasLoadedFromStorageRef = useRef(false)
  
  // Dialog açıklık durumunu ref ile takip et (closure sorununu önlemek için)
  const isDialogOpenRef = useRef(false)

  const [isUploading, setIsUploading] = useState(false)
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    content: ""
  })
  const [toRecipients, setToRecipients] = useState<string[]>([])
  const [ccRecipients, setCcRecipients] = useState<string[]>([])
  const [bccRecipients, setBccRecipients] = useState<string[]>([])
  const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [showSchedulePopover, setShowSchedulePopover] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  // localStorage'dan form verilerini yükle (dialog açıldığında, reply/draft yoksa ve henüz yüklenmediyse)
  React.useEffect(() => {
    // Sadece yeni mail yazıyorsak (reply/draft yoksa) localStorage'dan yükle
    const isNewMail = !replyMode && !draftMail
    
    if (isDialogOpen && isNewMail && !hasLoadedFromStorageRef.current && typeof window !== 'undefined') {
      const savedState = loadFormStateFromStorage()
      if (savedState && Object.keys(savedState).length > 0) {
        console.log('Loading from localStorage:', savedState)
        // ÖNEMLİ: Flag'i hemen true yap ki form temizleme işlemi çalışmasın
        hasLoadedFromStorageRef.current = true
        
        // Sadece form verilerini geri yükle, dialog state'ini değil
        if (savedState.formData) {
          setFormData(savedState.formData)
        }
        if (savedState.toRecipients && savedState.toRecipients.length > 0) {
          setToRecipients(savedState.toRecipients)
        }
        if (savedState.ccRecipients && savedState.ccRecipients.length > 0) {
          setCcRecipients(savedState.ccRecipients)
        }
        if (savedState.bccRecipients && savedState.bccRecipients.length > 0) {
          setBccRecipients(savedState.bccRecipients)
        }
        if (savedState.currentDraftId) {
          setCurrentDraftId(savedState.currentDraftId)
        }
        
        // Yükleme yapıldıktan sonra prevFormDataRef'i güncelle ki gereksiz kayıt olmasın
        prevFormDataRef.current = JSON.stringify({
          formData: savedState.formData || { to: "", cc: "", bcc: "", subject: "", content: "" },
          toRecipients: savedState.toRecipients || [],
          ccRecipients: savedState.ccRecipients || [],
          bccRecipients: savedState.bccRecipients || [],
          currentDraftId: savedState.currentDraftId || null
        })
      } else {
        // Veri yoksa flag'i true yap ama formu temizleme işlemi yapılsın
        hasLoadedFromStorageRef.current = true
      }
    }
    
    // Dialog kapandığında yüklenmiş flag'ini sıfırla (bir sonraki açılış için)
    if (!isDialogOpen) {
      hasLoadedFromStorageRef.current = false
      prevFormDataRef.current = '' // Reset prev data
    }
  }, [isDialogOpen, replyMode, draftMail])
  
  // Dialog açıklık durumunu ref ile senkronize et
  React.useEffect(() => {
    isDialogOpenRef.current = isDialogOpen
  }, [isDialogOpen])

  // Form verilerini localStorage'a kaydet (dialog açıkken ve debounce ile)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const prevFormDataRef = React.useRef<string>('')
  
  // localStorage'a kaydetme fonksiyonu
  const saveToLocalStorage = React.useCallback(() => {
    if (!isDialogOpenRef.current || replyMode || draftMail) {
      return
    }
    
    const currentFormDataStr = JSON.stringify({
      formData,
      toRecipients,
      ccRecipients,
      bccRecipients,
      currentDraftId
    })
    
    // Veri değişmemişse kaydetme
    if (prevFormDataRef.current === currentFormDataStr) {
      return
    }
    
    console.log('Saving to localStorage:', { formData, toRecipients, ccRecipients, bccRecipients, currentDraftId })
    saveFormStateToStorage({
      formData,
      toRecipients,
      ccRecipients,
      bccRecipients,
      currentDraftId
    })
    prevFormDataRef.current = currentFormDataStr
  }, [formData, toRecipients, ccRecipients, bccRecipients, currentDraftId, replyMode, draftMail])
  
  React.useEffect(() => {
    // Dialog kapalıysa kaydetme
    if (!isDialogOpenRef.current) {
      return
    }
    
    // Form verilerini serialize et
    const currentFormDataStr = JSON.stringify({
      formData,
      toRecipients,
      ccRecipients,
      bccRecipients,
      currentDraftId
    })
    
    // Veri değişmemişse kaydetme
    if (prevFormDataRef.current === currentFormDataStr) {
      return
    }
    
    // Debounce ile kaydet (200ms - daha hızlı)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage()
    }, 200)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [isDialogOpen, formData, toRecipients, ccRecipients, bccRecipients, currentDraftId, saveToLocalStorage])
  
  // Sayfa kapanmadan/route değişmeden önce localStorage'a kaydet
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleBeforeUnload = () => {
      if (isDialogOpenRef.current && !replyMode && !draftMail) {
        saveToLocalStorage()
      }
    }
    
    // beforeunload event'i (sayfa kapanmadan önce)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Route değişmeden önce kaydet (Next.js için)
    const handleRouteChange = () => {
      if (isDialogOpenRef.current && !replyMode && !draftMail) {
        saveToLocalStorage()
      }
    }
    
    // Popstate (geri/ileri tuşları)
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handleRouteChange)
      // Component unmount olmadan önce de kaydet
      if (isDialogOpenRef.current && !replyMode && !draftMail) {
        saveToLocalStorage()
      }
    }
  }, [saveToLocalStorage, replyMode, draftMail])

  // Parent'tan gelen open prop'u değiştiğinde dialog'u aç (sadece açılma tetikleyicisi)
  // ÖNEMLİ: open false olsa bile dialog açık kalır - sadece kullanıcı action'ları dialog'u kapatabilir
  // Bu sayede mail yükleme (loading) sırasında dialog kapanmaz
  React.useEffect(() => {
    if (open) {
      // Parent'tan open=true geldiğinde dialog'u aç
      setIsDialogOpen(true)
    }
    // open=false geldiğinde hiçbir şey yapma - dialog açık kalır
    // Dialog sadece kullanıcı action'ları (gönder, iptal, kaydet) ile kapanır
  }, [open])

  // Dialog'u gerçekten kapat (sadece kullanıcı action'larından çağrılır)
  const handleInternalClose = (shouldNotifyParent = true) => {
    setIsDialogOpen(false)
    clearFormStateFromStorage() // Clear saved state when closing
    if (shouldNotifyParent) {
      onOpenChange(false)
    }
  }


  // Reply mode veya draft mode'a göre form verilerini otomatik doldur
  React.useEffect(() => {
    if (draftMail && isDialogOpen) {
      // Taslağı yükle
      setCurrentDraftId(draftMail._id)
      setToRecipients(draftMail.to?.map((r: any) => r.email) || [])
      setCcRecipients(draftMail.cc?.map((r: any) => r.email) || [])
      setBccRecipients(draftMail.bcc?.map((r: any) => r.email) || [])
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: draftMail.subject || '',
        content: draftMail.htmlContent || draftMail.content || ''
      })
      setShowCC(draftMail.cc && draftMail.cc.length > 0)
      setShowBCC(draftMail.bcc && draftMail.bcc.length > 0)

    } else if (replyMode && originalMail && isDialogOpen) {
      switch (replyMode) {
        case 'reply':
          // Sadece gönderene cevap ver
          setToRecipients([originalMail.from?.email || ''])
          const replyContent = `\n\n--- Orijinal Mesaj ---\n${originalMail.content || originalMail.htmlContent || ''}`
          setFormData(prev => ({
            ...prev,
            subject: originalMail.subject?.startsWith('Re:') ? originalMail.subject : `Re: ${originalMail.subject}`,
            content: replyContent.includes('<') ? replyContent : `<p>${replyContent.replace(/\n/g, '<br>')}</p>`
          }))
          break
        case 'replyAll':
          // Gönderen + tüm alıcılara cevap ver
          const allRecipients = [
            originalMail.from?.email,
            ...(originalMail.to?.map((r: any) => r.email) || []),
            ...(originalMail.cc?.map((r: any) => r.email) || [])
          ].filter(Boolean)
          setToRecipients(allRecipients)
          const replyAllContent = `\n\n--- Orijinal Mesaj ---\n${originalMail.content || originalMail.htmlContent || ''}`
          setFormData(prev => ({
            ...prev,
            subject: originalMail.subject?.startsWith('Re:') ? originalMail.subject : `Re: ${originalMail.subject}`,
            content: replyAllContent.includes('<') ? replyAllContent : `<p>${replyAllContent.replace(/\n/g, '<br>')}</p>`
          }))
          break
        case 'forward':
          // İlet
          const forwardContent = `\n\n--- İletilen Mesaj ---\nGönderen: ${originalMail.from?.name || 'Bilinmeyen'} <${originalMail.from?.email || 'Bilinmeyen'}>\nKonu: ${originalMail.subject}\n\n${originalMail.content || originalMail.htmlContent || ''}`
          setFormData(prev => ({
            ...prev,
            subject: originalMail.subject?.startsWith('Fwd:') ? originalMail.subject : `Fwd: ${originalMail.subject}`,
            content: forwardContent.includes('<') ? forwardContent : `<p>${forwardContent.replace(/\n/g, '<br>')}</p>`
          }))
          break
      }
    } else if (!replyMode && !draftMail && isDialogOpen && open) {
      // Yeni mail için formu temizle (sadece ilk açılışta ve localStorage'dan yükleme yapılmadıysa)
      // Eğer localStorage'dan veri yüklendiyse, formu temizleme
      if (!hasLoadedFromStorageRef.current) {
        setFormData({
          to: "",
          cc: "",
          bcc: "",
          subject: "",
          content: ""
        })
        setToRecipients([])
        setCcRecipients([])
        setBccRecipients([])
        setCurrentDraftId(null)
      }
    }
  }, [replyMode, originalMail, draftMail, isDialogOpen, open])

  // Cihazın dokunmatik olup olmadığını belirle (Tooltip dokunmatik cihazlarda çalışmaz)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
      setIsTouchDevice(touch)
    }
  }, [])

  // Bilgi ikonları için yardımcı bileşen: Desktop'ta Tooltip, mobilde AlertDialog
  const InfoHelp: React.FC<{ label?: string; children: React.ReactNode }> = ({ label = 'Bilgi', children }) => {
    const [openInfo, setOpenInfo] = useState(false)
    if (isTouchDevice) {
      return (
        <>
          <button
            type="button"
            aria-label={label}
            onClick={() => setOpenInfo(true)}
            className="p-0.5 text-muted-foreground"
          >
            <Info className="h-3 w-3 lg:h-4 lg:w-4" />
          </button>
          <AlertDialog open={openInfo} onOpenChange={setOpenInfo}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{label}</AlertDialogTitle>
                <AlertDialogDescription>
                  {children}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Tamam</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label={label} className="p-0.5 text-muted-foreground">
            <Info className="h-3 w-3 lg:h-4 lg:w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>{children}</div>
        </TooltipContent>
      </Tooltip>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Parse emails from input and update recipients
  const parseEmails = (input: string, field: 'to' | 'cc' | 'bcc') => {
    const emails = input.split(',').map(email => email.trim()).filter(Boolean)
    const validEmails = emails.filter(isValidEmail)

    switch (field) {
      case 'to':
        setToRecipients(validEmails)
        break
      case 'cc':
        setCcRecipients(validEmails)
        break
      case 'bcc':
        setBccRecipients(validEmails)
        break
    }
  }

  // Handle input change with email parsing
  const handleEmailInputChange = (field: 'to' | 'cc' | 'bcc', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle blur event to add emails when leaving input
  const handleEmailBlur = (field: 'to' | 'cc' | 'bcc') => {
    const inputValue = formData[field].trim()

    if (inputValue) {
      // Parse emails from current input
      const emails = inputValue.split(',').map(email => email.trim()).filter(Boolean)
      const validEmails = emails.filter(isValidEmail)

      // Add valid emails to recipient list
      switch (field) {
        case 'to':
          setToRecipients(prev => [...new Set([...prev, ...validEmails])]) // Remove duplicates
          break
        case 'cc':
          setCcRecipients(prev => [...new Set([...prev, ...validEmails])])
          break
        case 'bcc':
          setBccRecipients(prev => [...new Set([...prev, ...validEmails])])
          break
      }

      // Clear the input field if emails were added
      if (validEmails.length > 0) {
        setFormData(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  // Handle Enter key press to add emails as tags
  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: 'to' | 'cc' | 'bcc') => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const inputValue = formData[field].trim()

      if (inputValue) {
        // Parse emails from current input
        const emails = inputValue.split(',').map(email => email.trim()).filter(Boolean)
        const validEmails = emails.filter(isValidEmail)

        // Add valid emails to recipient list
        switch (field) {
          case 'to':
            setToRecipients(prev => [...new Set([...prev, ...validEmails])]) // Remove duplicates
            break
          case 'cc':
            setCcRecipients(prev => [...new Set([...prev, ...validEmails])])
            break
          case 'bcc':
            setBccRecipients(prev => [...new Set([...prev, ...validEmails])])
            break
        }

        // Clear the input field
        setFormData(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  // Remove recipient from list
  const removeRecipient = (email: string, field: 'to' | 'cc' | 'bcc') => {
    switch (field) {
      case 'to':
        setToRecipients(prev => prev.filter(e => e !== email))
        break
      case 'cc':
        setCcRecipients(prev => prev.filter(e => e !== email))
        break
      case 'bcc':
        setBccRecipients(prev => prev.filter(e => e !== email))
        break
    }
  }

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

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (toRecipients.length === 0) {
      toast.error("Lütfen en az bir alıcı seçin!")
      return
    }

    if (!formData.subject.trim()) {
      toast.error("Lütfen mail konusunu girin!")
      return
    }

    if (!formData.content.trim()) {
      toast.error("Lütfen mail içeriğini girin!")
      return
    }

    // Close dialog immediately
    handleInternalClose()

    // Reset form immediately so user can send another mail if needed
    const mailDataToSend = {
      to: toRecipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
      subject: formData.subject,
      content: formData.content,
      htmlContent: formData.content, // Rich text editor already provides HTML
      draftId: currentDraftId || undefined, // Eğer taslaktan gönderiyorsak ID'yi ekle
      attachments: attachments.map(attachment => ({
        filename: attachment.name,
        data: attachment.file,
        contentType: attachment.type,
        size: attachment.size,
        url: attachment.url || undefined
      }))
    }

    setFormData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      content: ""
    })
    setToRecipients([])
    setCcRecipients([])
    setBccRecipients([])
    setAttachments([])
    setShowCC(false)
    setShowBCC(false)

    // Show toast and send mail in background
    const loadingToastId = toast.loading("Mail gönderiliyor...")

    try {
      console.log("Sending mail with data:", mailDataToSend)

      // Call Redux action for sending mail
      const result = await dispatch(sendMail(mailDataToSend)).unwrap()

      console.log("Sent mail status:", result.mail?.status)

      // Dismiss loading toast
      toast.dismiss(loadingToastId)

      // Success
      toast.success("Mail başarıyla gönderildi!")

      // Callback ile parent component'e mail gönderildiğini bildir
      if (onMailSent) {
        onMailSent()
      }

    } catch (error: any) {
      console.error("Send mail failed:", error)

      // Dismiss loading toast
      toast.dismiss(loadingToastId)

      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Mail gönderilirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }

  // Planlı gönderme
  const handleScheduledSend = async () => {
    if (toRecipients.length === 0) {
      toast.error("Lütfen en az bir alıcı seçin!")
      return
    }

    if (!formData.subject.trim()) {
      toast.error("Lütfen mail konusunu girin!")
      return
    }

    if (!formData.content.trim()) {
      toast.error("Lütfen mail içeriğini girin!")
      return
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error("Lütfen gönderim tarih ve saatini seçin!")
      return
    }

    // Tarih ve saati birleştir
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      toast.error("Planlı gönderim tarihi gelecekte olmalıdır!")
      return
    }

    // Close dialog and popover immediately
    setShowSchedulePopover(false)
    handleInternalClose()

    // Reset form immediately
    const mailDataToSchedule = {
      to: toRecipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
      subject: formData.subject,
      content: formData.content,
      htmlContent: formData.content,
      draftId: currentDraftId || undefined,
      scheduledSendAt: scheduledDateTime.toISOString(),
      attachments: attachments.map(attachment => ({
        filename: attachment.name,
        data: attachment.file,
        contentType: attachment.type,
        size: attachment.size,
        url: attachment.url || undefined
      }))
    }

    setFormData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      content: ""
    })
    setToRecipients([])
    setCcRecipients([])
    setBccRecipients([])
    setAttachments([])
    setShowCC(false)
    setShowBCC(false)
    setScheduledDate("")
    setScheduledTime("")

    // Show toast and schedule mail in background
    const loadingToastId = toast.loading("Mail planlanıyor...")

    try {

      const result = await dispatch(scheduleMail(mailDataToSchedule)).unwrap()

      toast.dismiss(loadingToastId)
      toast.success(result.message || "Mail başarıyla planlandı!")

      if (onMailSent) {
        onMailSent()
      }

    } catch (error: any) {
      console.error("Schedule mail failed:", error)
      toast.dismiss(loadingToastId)

      const errorMessage = typeof error === 'string' ? error : error?.message || "Mail planlanırken bir hata oluştu"
      toast.error(errorMessage)
    }
  }

  // Form içeriğinin olup olmadığını kontrol et
  const hasFormContent = () => {
    return toRecipients.length > 0 ||
      ccRecipients.length > 0 ||
      bccRecipients.length > 0 ||
      formData.subject.trim() !== "" ||
      formData.content.trim() !== "" ||
      attachments.length > 0
  }

  // Taslak kaydetme fonksiyonu
  const handleSaveDraft = async () => {
    try {
      const draftData = {
        to: toRecipients.length > 0 ? toRecipients : undefined,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject: formData.subject.trim() || undefined,
        content: formData.content.trim() || undefined,
        htmlContent: formData.content.trim() || undefined,
        draftId: currentDraftId || undefined,
        attachments: attachments.map(attachment => ({
          filename: attachment.name,
          data: attachment.file,
          contentType: attachment.type,
          size: attachment.size,
          url: attachment.url || undefined
        }))
      }

      const result = await dispatch(saveDraft(draftData)).unwrap()

      // Taslak ID'sini kaydet (güncelleme için)
      if (result.draft && result.draft._id) {
        setCurrentDraftId(result.draft._id)
      }

      toast.success("Taslak kaydedildi!")

      // Formu temizle ve dialogu kapat
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        content: ""
      })
      setToRecipients([])
      setCcRecipients([])
      setBccRecipients([])
      setAttachments([])
      setShowCC(false)
      setShowBCC(false)
      setCurrentDraftId(null)
      handleInternalClose()

      // Mail listesini yenile
      if (onMailSent) {
        onMailSent()
      }
    } catch (error: any) {
      console.error("Save draft failed:", error)
      toast.error(typeof error === 'string' ? error : error?.message || "Taslak kaydedilemedi")
    }
  }

  const handleClose = () => {
    // Eğer form içeriği varsa ve taslak değilse, kaydetme dialogunu göster
    if (hasFormContent()) {
      setShowSaveDraftDialog(true)
    } else {
      // İçerik yoksa direkt kapat
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        content: ""
      })
      setToRecipients([])
      setCcRecipients([])
      setBccRecipients([])
      setAttachments([])
      setShowCC(false)
      setShowBCC(false)
      setCurrentDraftId(null)
      handleInternalClose()
    }
  }

  // Taslak kaydetmeden kapat
  const handleCloseWithoutSaving = () => {
    setShowSaveDraftDialog(false)
    setFormData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      content: ""
    })
    setToRecipients([])
    setCcRecipients([])
    setBccRecipients([])
    setAttachments([])
    setShowCC(false)
    setShowBCC(false)
    setCurrentDraftId(null)
    handleInternalClose()
  }

  // Taslak kaydet ve kapat
  const handleSaveAndClose = async () => {
    setShowSaveDraftDialog(false)
    await handleSaveDraft()
  }

  return (
    <>
      {/* Gmail-style compose window - Desktop: sağ altta, Mobile: tam ekran */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .compose-window {
            height: 600px !important;
            max-height: calc(100vh - 100px) !important;
          }
        }
      `}</style>
      <div
        className={`compose-window fixed bottom-0 right-0 lg:right-4 z-50 w-full lg:max-w-2xl shadow-2xl lg:rounded-t-lg bg-background border-t lg:border border-border overflow-hidden flex flex-col transition-opacity duration-200 ${isDialogOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        style={{
          height: isDialogOpen ? '100vh' : '0',
          maxHeight: isDialogOpen ? '100vh' : '0',
          display: isDialogOpen ? 'flex' : 'none'
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 lg:h-5 lg:w-5" />
            <h2 className="text-sm lg:text-base font-semibold">
              {replyMode === 'reply' ? 'Cevapla' :
                replyMode === 'replyAll' ? 'Tümünü Cevapla' :
                  replyMode === 'forward' ? 'İlet' : 'Yeni Mail'}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4">

          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            <div className="grid gap-3 lg:gap-4">
              {/* To Field */}
              <div className="space-y-1.5 lg:space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="to" className="text-xs lg:text-sm">Alıcı *</Label>
                  <InfoHelp label="Alıcı hakkında bilgi">
                    Mailinizin gönderileceği kişinin e-posta adresi. Alıcı, e-postayı kim gönderdiğini görebilir ve diğer alıcıları da görebilir.
                  </InfoHelp>
                </div>
                <Input
                  id="to"
                  placeholder="ornek@email.com (Enter/Tab ile ekle)"
                  value={formData.to}
                  onChange={(e) => handleEmailInputChange("to", e.target.value)}
                  onKeyPress={(e) => handleEmailKeyPress(e, "to")}
                  onBlur={() => handleEmailBlur("to")}
                  required={toRecipients.length === 0}
                  disabled={false}
                  className={`text-sm ${toRecipients.length > 0 ? "border-green-500" : ""}`}
                />
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Mail adresini yazıp Enter'a basın, Tab ile geçin veya virgül ile ayırın
                </p>
                {toRecipients.length > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ {toRecipients.length} alıcı seçildi
                  </p>
                )}
                {/* To Recipients Chips */}
                {toRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-2">
                    {toRecipients.map((email) => (
                      <div key={email} className="inline-flex items-center gap-1.5 lg:gap-2 bg-secondary text-secondary-foreground rounded-full px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm">
                        <span className="truncate max-w-[150px] lg:max-w-none">{email}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 lg:h-5 lg:w-5 p-0 rounded-full hover:bg-muted-foreground/20"
                          onClick={() => removeRecipient(email, 'to')}
                          disabled={false}
                        >
                          <X className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CC Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cc">Kopya (CC)</Label>
                    <InfoHelp label="CC nedir?">
                      <strong>CC (Carbon Copy)</strong> - Kopya alıcılar. Bu kişiler mailin bir kopyasını alır ve tüm alıcılar birbirlerini görebilir. Bilgilendirme amaçlı kullanılır.
                    </InfoHelp>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cc-toggle"
                      checked={showCC}
                      onCheckedChange={setShowCC}
                      disabled={false}
                    />
                    <Label htmlFor="cc-toggle" className="text-sm">
                      {showCC ? 'Gizle' : 'Göster'}
                    </Label>
                  </div>
                </div>
                {showCC && (
                  <>
                    <Input
                      id="cc"
                      placeholder="kopya@email.com (Enter/Tab ile ekle)"
                      value={formData.cc}
                      onChange={(e) => handleEmailInputChange("cc", e.target.value)}
                      onKeyPress={(e) => handleEmailKeyPress(e, "cc")}
                      onBlur={() => handleEmailBlur("cc")}
                      disabled={false}
                    />
                    {/* CC Recipients Chips */}
                    {ccRecipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ccRecipients.map((email) => (
                          <div key={email} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-sm">
                            <span>{email}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 rounded-full hover:bg-muted-foreground/20"
                              onClick={() => removeRecipient(email, 'cc')}
                              disabled={false}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* BCC Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bcc">Gizli Kopya (BCC)</Label>
                    <InfoHelp label="BCC nedir?">
                      <strong>BCC (Blind Carbon Copy)</strong> - Gizli kopya alıcılar. Bu kişilerin e-posta aldığı diğer alıcılar tarafından görünmez. Gizlilik gerektiğinde kullanılır.
                    </InfoHelp>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bcc-toggle"
                      checked={showBCC}
                      onCheckedChange={setShowBCC}
                      disabled={false}
                    />
                    <Label htmlFor="bcc-toggle" className="text-sm">
                      {showBCC ? 'Gizle' : 'Göster'}
                    </Label>
                  </div>
                </div>
                {showBCC && (
                  <>
                    <Input
                      id="bcc"
                      placeholder="gizli@email.com (Enter/Tab ile ekle)"
                      value={formData.bcc}
                      onChange={(e) => handleEmailInputChange("bcc", e.target.value)}
                      onKeyPress={(e) => handleEmailKeyPress(e, "bcc")}
                      onBlur={() => handleEmailBlur("bcc")}
                      disabled={false}
                    />
                    {/* BCC Recipients Chips */}
                    {bccRecipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bccRecipients.map((email) => (
                          <div key={email} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-sm">
                            <span>{email}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 rounded-full hover:bg-muted-foreground/20"
                              onClick={() => removeRecipient(email, 'bcc')}
                              disabled={false}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="subject">Konu *</Label>
                  <InfoHelp label="Konu hakkında bilgi">
                    E-postanızın konusu. Alıcının gelen kutusunda ilk göreceği metin. Açık ve anlaşılır bir konu yazmanız önerilir.
                  </InfoHelp>
                </div>
                <Input
                  id="subject"
                  placeholder="Mail konusu"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  required
                  disabled={false}
                />
              </div>

              {/* Content Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="content">İçerik *</Label>
                  <InfoHelp label="İçerik hakkında bilgi">
                    E-postanızın ana metni. Zengin metin düzenleyici ile metin biçimlendirme, bağlantı ekleme ve daha fazlasını yapabilirsiniz.
                  </InfoHelp>
                </div>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange("content", content)}
                  placeholder="Mail içeriğinizi yazın..."
                />
              </div>

              {/* Attachments Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Ekler</Label>
                    <InfoHelp label="Ekler hakkında bilgi">
                      E-postanıza her türlü dosya ekleyebilirsiniz (resimler, videolar, belgeler, vb.). Toplam dosya boyutu 100MB'ı geçemez. Dosyalar güvenli bir şekilde Cloudinary'ye yüklenir.
                    </InfoHelp>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openFileChooser}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Yükleniyor...' : 'Dosya Ekle'}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 border rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
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
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                          disabled={false}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="border-t p-3 lg:p-4 bg-background">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={false}
              size="sm"
              className="text-xs lg:text-sm"
            >
              <X className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              İptal
            </Button>

            <div className="flex items-center gap-2">
              {/* Planlı Gönderme Butonu */}
              <Popover open={showSchedulePopover} onOpenChange={setShowSchedulePopover}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={toRecipients.length === 0 || !formData.subject || !formData.content}
                    className="text-xs lg:text-sm"
                  >
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Planla</span>
                    <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Planlı Gönderim</h4>
                      <p className="text-sm text-muted-foreground">
                        Mail'i belirli bir tarih ve saatte göndermek için planla
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="schedule-date" className="text-sm">Tarih</Label>
                        <Input
                          id="schedule-date"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="schedule-time" className="text-sm">Saat</Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {scheduledDate && scheduledTime && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                          <p className="text-blue-900 dark:text-blue-100">
                            Mail <strong>{new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('tr-TR')}</strong> tarihinde gönderilecek
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSchedulePopover(false)}
                        className="flex-1"
                      >
                        İptal
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleScheduledSend}
                        disabled={!scheduledDate || !scheduledTime}
                        className="flex-1"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Planla
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Hemen Gönder Butonu */}
              <Button
                type="submit"
                disabled={toRecipients.length === 0 || !formData.subject || !formData.content}
                size="sm"
                onClick={handleSubmit}
                className="text-xs lg:text-sm"
              >
                <Send className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                Gönder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Taslak Kaydetme Onay Dialogu */}
      <AlertDialog open={showSaveDraftDialog} onOpenChange={setShowSaveDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Taslak olarak kaydetmek istiyor musunuz?</AlertDialogTitle>
            <AlertDialogDescription>
              Yazdığınız mail henüz gönderilmedi. Bu maili taslak olarak kaydetmek ister misiniz?
              Kaydedilen taslağı daha sonra Taslaklar bölümünden bulabilir ve gönderebilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseWithoutSaving}>
              Kaydetme
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndClose}>
              Taslak Olarak Kaydet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
