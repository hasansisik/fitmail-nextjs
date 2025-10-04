"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppDispatch } from "@/redux/hook"
import { sendMail } from "@/redux/actions/mailActions"
import { toast } from "sonner"
import { Loader2, Send, X } from "lucide-react"

interface SendMailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendMailDialog({ open, onOpenChange }: SendMailDialogProps) {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.to || !formData.subject || !formData.content) {
      toast.error("Alıcı, konu ve içerik alanları zorunludur!")
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading("Mail gönderiliyor...")

    try {
      // Prepare mail data
      const mailData = {
        to: formData.to.split(',').map(email => email.trim()).filter(Boolean),
        cc: formData.cc ? formData.cc.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        subject: formData.subject,
        content: formData.content,
        htmlContent: formData.content.replace(/\n/g, '<br>')
      }

      // Call Redux action for sending mail
      const result = await dispatch(sendMail(mailData)).unwrap()
      console.log("Mail sent successfully:", result)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Success
      toast.success("Mail başarıyla gönderildi!")
      
      // Reset form and close dialog
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        content: ""
      })
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
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Birden fazla alıcı için virgül ile ayırın
              </p>
            </div>

            {/* CC Field */}
            <div className="space-y-2">
              <Label htmlFor="cc">Kopya (CC)</Label>
              <Input
                id="cc"
                placeholder="kopya@email.com"
                value={formData.cc}
                onChange={(e) => handleInputChange("cc", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* BCC Field */}
            <div className="space-y-2">
              <Label htmlFor="bcc">Gizli Kopya (BCC)</Label>
              <Input
                id="bcc"
                placeholder="gizli@email.com"
                value={formData.bcc}
                onChange={(e) => handleInputChange("bcc", e.target.value)}
                disabled={isLoading}
              />
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
                disabled={isLoading}
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
                disabled={isLoading}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.to || !formData.subject || !formData.content}
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
