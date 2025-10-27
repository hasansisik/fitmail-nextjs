"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { sendMail, saveDraft } from "@/redux/actions/mailActions"
import { uploadFileToCloudinary } from "@/utils/cloudinary"
import { toast } from "sonner"
import { 
  Loader2, 
  Send, 
  X, 
  Paperclip, 
  FileText, 
  Trash2,
  Info
} from "lucide-react"

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

export function SendMailDialog({ open, onOpenChange, replyMode = null, originalMail = null, draftMail = null, onMailSent }: SendMailDialogProps) {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
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
  
  // Seçili hesabı al (Redux'tan)
  const selectedAccountEmail = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedAccountEmail')
    }
    return null
  }, [])

  // Reply mode veya draft mode'a göre form verilerini otomatik doldur
  React.useEffect(() => {
    if (draftMail && open) {
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
      
      // Attachments varsa yükle (ama File objesi yok, sadece göster)
      if (draftMail.attachments && draftMail.attachments.length > 0) {
        // Taslaktaki attachments'ı göster ama File objesi oluşturamayız
        // Bu yüzden kullanıcının yeniden yüklemesi gerekecek
        console.log('Draft has attachments:', draftMail.attachments)
      }
    } else if (replyMode && originalMail && open) {
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
    } else if (!replyMode && !draftMail && open) {
      // Yeni mail için formu temizle
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
  }, [replyMode, originalMail, draftMail, open])

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
    onOpenChange(false)
    
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
      console.log("Mail sent successfully:", result)
      console.log("Sent mail folder:", result.mail?.folder)
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
      onOpenChange(false)
      
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
      onOpenChange(false)
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
    onOpenChange(false)
  }

  // Taslak kaydet ve kapat
  const handleSaveAndClose = async () => {
    setShowSaveDraftDialog(false)
    await handleSaveDraft()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {replyMode === 'reply' ? 'Cevapla' : 
             replyMode === 'replyAll' ? 'Tümünü Cevapla' : 
             replyMode === 'forward' ? 'İlet' : 'Yeni Mail Gönder'}
          </DialogTitle>
          <DialogDescription>
            {replyMode === 'reply' ? 'Bu maili cevaplamak için aşağıdaki bilgileri doldurun.' :
             replyMode === 'replyAll' ? 'Bu maili tüm alıcılara cevaplamak için aşağıdaki bilgileri doldurun.' :
             replyMode === 'forward' ? 'Bu maili iletmek için aşağıdaki bilgileri doldurun.' :
             'Mail göndermek için aşağıdaki bilgileri doldurun.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* To Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="to">Alıcı *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Mailinizin gönderileceği kişinin e-posta adresi. Alıcı, e-postayı kim gönderdiğini görebilir ve diğer alıcıları da görebilir.</p>
                  </TooltipContent>
                </Tooltip>
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
                className={toRecipients.length > 0 ? "border-green-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Mail adresini yazıp Enter'a basın, Tab ile geçin veya virgül ile ayırın
              </p>
              {toRecipients.length > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ {toRecipients.length} alıcı seçildi
                </p>
              )}
              {/* To Recipients Chips */}
              {toRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {toRecipients.map((email) => (
                    <div key={email} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-sm">
                      <span>{email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 rounded-full hover:bg-muted-foreground/20"
                        onClick={() => removeRecipient(email, 'to')}
                        disabled={false}
                      >
                        <X className="h-3 w-3" />
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p><strong>CC (Carbon Copy)</strong> - Kopya alıcılar. Bu kişiler mailin bir kopyasını alır ve tüm alıcılar birbirlerini görebilir. Bilgilendirme amaçlı kullanılır.</p>
                    </TooltipContent>
                  </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p><strong>BCC (Blind Carbon Copy)</strong> - Gizli kopya alıcılar. Bu kişilerin e-posta aldığı diğer alıcılar tarafından görünmez. Gizlilik gerektiğinde kullanılır.</p>
                    </TooltipContent>
                  </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>E-postanızın konusu. Alıcının gelen kutusunda ilk göreceği metin. Açık ve anlaşılır bir konu yazmanız önerilir.</p>
                  </TooltipContent>
                </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>E-postanızın ana metni. Zengin metin düzenleyici ile metin biçimlendirme, bağlantı ekleme ve daha fazlasını yapabilirsiniz.</p>
                  </TooltipContent>
                </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>E-postanıza dosya ekleyebilirsiniz. Belgeler, resimler, videolar ve diğer dosya türleri desteklenir. Dosyalar güvenli bir şekilde Cloudinary'ye yüklenir.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
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
                accept="*/*"
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

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={false}
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            
            
            <Button
              type="submit"
              disabled={toRecipients.length === 0 || !formData.subject || !formData.content}
            >
              <Send className="h-4 w-4 mr-2" />
              Gönder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

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
    </Dialog>
  )
}
