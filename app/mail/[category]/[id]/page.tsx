"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMailById } from "@/redux/actions/mailActions"
import { MailDisplay } from "@/components/mail-display"
import { Button } from "@/components/ui/button"
import { Metadata } from "@/components/metadata"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function MailDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedMail, mailsLoading, mailsError } = useAppSelector((state) => state.mail)
  
  const [isLoading, setIsLoading] = useState(false)
  const mailId = params.id as string
  const category = params.category as string

  useEffect(() => {
    if (mailId) {
      setIsLoading(true)
      dispatch(getMailById(mailId))
        .unwrap()
        .then(() => {
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Mail yüklenirken hata:", error)
          toast.error("Mail yüklenirken bir hata oluştu")
          setIsLoading(false)
        })
    }
  }, [mailId, dispatch])

  const handleBack = () => {
    // Kategori sayfasına dön
    router.push(`/mail/${category}`)
  }

  if (isLoading || mailsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Mail yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (mailsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Hata</h2>
          <p className="text-muted-foreground">{mailsError}</p>
        </div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    )
  }

  if (!selectedMail) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Mail Bulunamadı</h2>
          <p className="text-muted-foreground">Aradığınız mail bulunamadı veya silinmiş olabilir.</p>
        </div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    )
  }

  return (
    <>
      <Metadata 
        title={`${selectedMail.subject} - Fitmail`}
        description={`${selectedMail.subject} - Fitmail ile e-posta okuyun`}
        keywords="email, e-posta, mail, fitmail"
      />
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold truncate">{selectedMail.subject}</h1>
            <p className="text-sm text-muted-foreground">
              Alıcı: {selectedMail.to?.map((recipient: { name: string; email: string }) => `${recipient.name} <${recipient.email}>`).join(', ')}
            </p>
          </div>
        </div>

        {/* Mail Content */}
        <div className="flex-1 overflow-hidden">
          <MailDisplay mail={selectedMail} />
        </div>
      </div>
    </>
  )
}
