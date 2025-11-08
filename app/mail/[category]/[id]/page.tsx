"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMailById, getMailsByCategory, getMailsByLabelCategory, getMailStats, getScheduledMails, getStarredMails } from "@/redux/actions/mailActions"
import { MailDisplay } from "@/components/mail-display"
import { Button } from "@/components/ui/button"
import { Metadata } from "@/components/metadata"
import { ArrowLeft, Loader2, Menu } from "lucide-react"
import { toast } from "sonner"
import { useMobileSidebar } from "../../layout"

export default function MailDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedMail, mailsLoading, mailsError } = useAppSelector((state) => state.mail)
  const mobileSidebar = useMobileSidebar()
  
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

  // Mail işlemlerinden sonra liste yenileme fonksiyonu
  const handleMailSent = async () => {
    try {
      // Kategoriye göre doğru action'ı çağır
      if (category === 'scheduled') {
        await dispatch(getScheduledMails({ page: 1, limit: 50 })).unwrap()
      } else if (category === 'starred') {
        await dispatch(getStarredMails({ page: 1, limit: 50 })).unwrap()
      } else if (['social', 'updates', 'forums', 'shopping', 'promotions'].includes(category)) {
        await dispatch(getMailsByLabelCategory({ category, page: 1, limit: 50 })).unwrap()
      } else {
        await dispatch(getMailsByCategory({ folder: category, page: 1, limit: 50 })).unwrap()
      }
      
      // Stats'ı da yenile
      await dispatch(getMailStats()).unwrap()
    } catch (error) {
      console.error("Refresh failed:", error)
    }
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
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 p-3 lg:p-4 border-b">
          {/* Mobil: Butonlar üst satırda, Desktop: Butonlar ve mail bilgileri yan yana */}
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* Mobile Menu Toggle Button */}
            {mobileSidebar && (
              <Button
                size="sm"
                variant="outline"
                onClick={mobileSidebar.toggleMobileSidebar}
                className="lg:hidden h-8 w-8 p-0"
                title={
                  mobileSidebar.mobileState === 'hidden' ? 'Menüyü göster (ikonlar)' :
                  mobileSidebar.mobileState === 'collapsed' ? 'Menüyü genişlet (yazılar)' :
                  'Menüyü gizle'
                }
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            {/* Geri Butonu */}
            <Button onClick={handleBack} variant="outline" size="sm" className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Geri</span>
            </Button>
          </div>
          {/* Mail Bilgileri */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-semibold truncate">{selectedMail.subject}</h1>
            <p className="text-xs lg:text-sm text-muted-foreground truncate">
              Alıcı: {selectedMail.to?.map((recipient: { name: string; email: string }) => `${recipient.name} <${recipient.email}>`).join(', ')}
            </p>
          </div>
        </div>

        {/* Mail Content */}
        <div className="flex-1 overflow-hidden">
          <MailDisplay 
            mail={selectedMail} 
            onMailSent={handleMailSent}
            onToggleMaximize={handleBack}
          />
        </div>
      </div>
    </>
  )
}
