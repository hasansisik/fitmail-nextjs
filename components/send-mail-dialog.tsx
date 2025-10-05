"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useAppDispatch } from "@/redux/hook"
import { sendMail, getMailsByCategory, getMailStats } from "@/redux/actions/mailActions"
import { uploadFileToCloudinary } from "@/utils/cloudinary"
import { toast } from "sonner"
import { 
  Loader2, 
  Send, 
  X, 
  Paperclip, 
  FileText, 
  Plus,
  Trash2
} from "lucide-react"

interface SendMailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  file: File
  url?: string | null
}

export function SendMailDialog({ open, onOpenChange }: SendMailDialogProps) {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          toast.success(`${successCount} dosya başarıyla Cloudinary'ye yüklendi`)
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
    
    if (!formData.to || !formData.subject || !formData.content) {
      toast.error("Alıcı, konu ve içerik alanları zorunludur!")
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading("Mail gönderiliyor...")

    try {
      // Prepare attachments for sending
      const attachmentsData = attachments.map(attachment => ({
        filename: attachment.name,
        data: attachment.file,
        contentType: attachment.type,
        size: attachment.size,
        url: attachment.url || undefined // Cloudinary URL'sini ekle
      }));

      // Prepare mail data
      const mailData = {
        to: formData.to.split(',').map(email => email.trim()).filter(Boolean),
        cc: formData.cc ? formData.cc.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        subject: formData.subject,
        content: formData.content,
        htmlContent: formData.content.replace(/\n/g, '<br>'),
        attachments: attachmentsData.length > 0 ? attachmentsData : undefined
      }

      console.log("Sending mail with data:", mailData)

      // Call Redux action for sending mail
      const result = await dispatch(sendMail(mailData)).unwrap()
      console.log("Mail sent successfully:", result)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Success
      toast.success("Mail başarıyla gönderildi!")
      
      // Refresh mail list and stats
      try {
        await dispatch(getMailsByCategory({
          folder: "inbox",
          page: 1,
          limit: 50
        })).unwrap()
        
        await dispatch(getMailStats()).unwrap()
      } catch (refreshError) {
        console.error("Failed to refresh mail list:", refreshError)
        // Don't show error to user as mail was sent successfully
      }
      
      // Reset form and close dialog
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        content: ""
      })
      setAttachments([])
      setShowCC(false)
      setShowBCC(false)
      onOpenChange(false)
      
    } catch (error: any) {
      console.error("Send mail failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Mail gönderilirken bir hata oluştu"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        content: ""
      })
      setAttachments([])
      setShowCC(false)
      setShowBCC(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Yeni Mail Gönder
          </DialogTitle>
          <DialogDescription>
            Mail göndermek için aşağıdaki bilgileri doldurun.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* To Field */}
            <div className="space-y-2">
              <Label htmlFor="to">Alıcı *</Label>
              <Input
                id="to"
                placeholder="ornek@email.com, diger@email.com"
                value={formData.to}
                onChange={(e) => handleInputChange("to", e.target.value)}
                required
                disabled={isLoading || false}
              />
              <p className="text-xs text-muted-foreground">
                Birden fazla alıcı için virgül ile ayırın
              </p>
            </div>

            {/* CC Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cc">Kopya (CC)</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cc-toggle"
                    checked={showCC}
                    onCheckedChange={setShowCC}
                    disabled={isLoading || false}
                  />
                  <Label htmlFor="cc-toggle" className="text-sm">
                    {showCC ? 'Gizle' : 'Göster'}
                  </Label>
                </div>
              </div>
              {showCC && (
                <Input
                  id="cc"
                  placeholder="kopya@email.com"
                  value={formData.cc}
                  onChange={(e) => handleInputChange("cc", e.target.value)}
                  disabled={isLoading || false}
                />
              )}
            </div>

            {/* BCC Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bcc">Gizli Kopya (BCC)</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bcc-toggle"
                    checked={showBCC}
                    onCheckedChange={setShowBCC}
                    disabled={isLoading || false}
                  />
                  <Label htmlFor="bcc-toggle" className="text-sm">
                    {showBCC ? 'Gizle' : 'Göster'}
                  </Label>
                </div>
              </div>
              {showBCC && (
                <Input
                  id="bcc"
                  placeholder="gizli@email.com"
                  value={formData.bcc}
                  onChange={(e) => handleInputChange("bcc", e.target.value)}
                  disabled={isLoading || false}
                />
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject">Konu *</Label>
              <Input
                id="subject"
                placeholder="Mail konusu"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                required
                disabled={isLoading || false}
              />
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content">İçerik *</Label>
              <Textarea
                id="content"
                placeholder="Mail içeriğinizi yazın..."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                required
                disabled={isLoading || false}
                rows={8}
                className="resize-none"
              />
            </div>

                        {/* Attachments Field */}
                        <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ekler</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || false || isUploading}
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
                              <span className="text-xs text-green-600 font-medium">✓ Cloudinary'de</span>
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
                        disabled={isLoading || false}
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
              disabled={isLoading || false}
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            
            
            <Button
              type="submit"
              disabled={isLoading || false || !formData.to || !formData.subject || !formData.content}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
