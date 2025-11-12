import { ScrollArea } from "@/components/ui/scroll-area"
import { useMail } from "@/app/mail/use-mail"
import { MailItem } from "@/components/mail-item"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { getMailById, deleteMail, moveMailToFolder, markMailAsStarred, toggleMailReadStatus, markMailAsImportant, moveMailToCategory, removeMailFromCategory } from "@/redux/actions/mailActions"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Archive, Star, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

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

interface MailListProps {
  items: ApiMail[]
  loading?: boolean
  error?: string | null
  categoryTitle?: string
  isSelectMode?: boolean
  onSelectModeChange?: (isSelectMode: boolean) => void
  onDraftClick?: (draft: ApiMail) => void
  onScheduledMailClick?: (scheduledMail: ApiMail) => void
  onRefresh?: () => void
}

export function MailList({ 
  items, 
  loading = false, 
  error = null, 
  categoryTitle = "Gelen Kutusu",
  isSelectMode = false,
  onSelectModeChange,
  onDraftClick,
  onScheduledMailClick,
  onRefresh
}: MailListProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Çoktan seçmeli state
  const [selectedMails, setSelectedMails] = useState<Set<string>>(new Set())
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)
  
  // Çoktan seçmeli fonksiyonları
  const toggleSelectMode = () => {
    const newSelectMode = !isSelectMode
    onSelectModeChange?.(newSelectMode)
    if (!newSelectMode) {
      setSelectedMails(new Set())
    }
  }
  
  const toggleSelectAll = () => {
    if (selectedMails.size === items.length) {
      setSelectedMails(new Set())
    } else {
      setSelectedMails(new Set(items.map(item => item._id)))
    }
  }
  
  const toggleSelectMail = (mailId: string) => {
    const newSelected = new Set(selectedMails)
    if (newSelected.has(mailId)) {
      newSelected.delete(mailId)
    } else {
      newSelected.add(mailId)
    }
    setSelectedMails(newSelected)
  }
  
  const handleBulkAction = async (action: string) => {
    const selectedMailIds = Array.from(selectedMails)
    
    if (selectedMailIds.length === 0) {
      toast.error("Hiç mail seçilmedi!")
      return
    }

    setIsBulkActionLoading(true)
    try {
      switch (action) {
        case 'delete':
          // Çöp kutusundaysa kalıcı sil, değilse çöp kutusuna taşı
          if (categoryTitle === "Çöp Kutusu") {
            // Kalıcı silme için her maili tek tek sil
            for (const mailId of selectedMailIds) {
              await dispatch(deleteMail(mailId)).unwrap()
            }
            toast.success(`${selectedMailIds.length} mail kalıcı olarak silindi!`)
          } else {
            // Her maili tek tek çöp kutusuna taşı (deleteMail zaten çöp kutusuna taşıyor)
            for (const mailId of selectedMailIds) {
              await dispatch(deleteMail(mailId)).unwrap()
            }
            toast.success(`${selectedMailIds.length} mail çöp kutusuna taşındı!`)
          }
          break
          
        case 'archive':
          // Her maili tek tek arşive taşı
          // Eğer mail zaten arşivdeyse, arşivden çıkarmak yerine sadece taşıma işlemi yapılır
          for (const mailId of selectedMailIds) {
            await dispatch(moveMailToFolder({ mailId, folder: 'archive' })).unwrap()
          }
          toast.success(`${selectedMailIds.length} mail arşivlendi!`)
          break
          
        case 'unarchive':
          // Arşivden çıkar - inbox'a taşı
          for (const mailId of selectedMailIds) {
            await dispatch(moveMailToFolder({ mailId, folder: 'inbox' })).unwrap()
          }
          toast.success(`${selectedMailIds.length} mail arşivden çıkarıldı!`)
          break
          
        case 'restore':
          // Çöp kutusundan geri yükle - inbox'a taşı
          for (const mailId of selectedMailIds) {
            await dispatch(moveMailToFolder({ mailId, folder: 'inbox' })).unwrap()
          }
          toast.success(`${selectedMailIds.length} mail geri yüklendi!`)
          break
          
        case 'star':
          // Her maili tek tek yıldızla (toggle - eğer zaten yıldızlıysa kaldırır)
          for (const mailId of selectedMailIds) {
            await dispatch(markMailAsStarred(mailId)).unwrap()
          }
          // Toggle olduğu için genel mesaj göster
          toast.success(`${selectedMailIds.length} mail için yıldız durumu güncellendi!`)
          break
          
        case 'markAsRead':
          // TODO: Implement mark as read bulk action
          toast.info("Okundu olarak işaretleme özelliği yakında eklenecek!")
          break
          
        case 'markAsUnread':
          // TODO: Implement mark as unread bulk action
          toast.info("Okunmadı olarak işaretleme özelliği yakında eklenecek!")
          break
          
        case 'moveToSpam':
          // Her maili tek tek spam'e taşı
          for (const mailId of selectedMailIds) {
            await dispatch(moveMailToFolder({ mailId, folder: 'spam' })).unwrap()
          }
          toast.success(`${selectedMailIds.length} mail spam'e taşındı!`)
          break
          
        default:
          toast.error("Bilinmeyen işlem!")
          return
      }
      
      // Seçimi temizle ve select mode'u kapat
      setSelectedMails(new Set())
      onSelectModeChange?.(false)
      
      // Mail listesini ve stats'ı yenile - callback ile parent'a bildir
      if (onRefresh) {
        await onRefresh()
      }
      
    } catch (error: any) {
      console.error("Bulk action failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "İşlem sırasında bir hata oluştu"
      toast.error(errorMessage)
    } finally {
      setIsBulkActionLoading(false)
    }
  }
  
  // Kategori başlığını URL slug'ına çevir
  const getCategorySlug = (title: string) => {
    const mapping: Record<string, string> = {
      "Gelen Kutusu": "inbox",
      "Gönderilenler": "sent",
      "Taslaklar": "drafts",
      "Planlanan": "scheduled",
      "Spam": "spam",
      "Çöp Kutusu": "trash",
      "Arşiv": "archive",
      "Sosyal": "social",
      "Güncellemeler": "updates",
      "Forumlar": "forums",
      "Alışveriş": "shopping",
      "Promosyonlar": "promotions"
    }
    return mapping[title] || "inbox"
  }
  
  const handleMailAction = async (action: string, mailId: string, data?: any) => {
    try {
      // İşlemler mail-context-menu'de yapılıyor, burada sadece refresh yap
      // Mail listesini ve stats'ı yenile - bu sayede silinen/taşınan mailler listeden kaldırılır
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error: any) {
      console.error("Mail action failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "İşlem başarısız"
      toast.error(errorMessage)
    }
  }

  // Loading'i sadece ilk yüklemede göster (mailler boşsa)
  // Kategori değişikliklerinde loading gösterme (mevcut mailler varsa)
  if (loading && items.length === 0) {
    return (
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text="Mailler yükleniyor..." />
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (error) {
    return (
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Hata: {error}</div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-2 sm:p-4 pt-0">
        {/* Çoktan seçmeli header */}
        {isSelectMode && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg border gap-2">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedMails.size === items.length && items.length > 0}
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm font-medium">
                {selectedMails.size > 0 
                  ? `${selectedMails.size} mail seçildi` 
                  : 'Tümünü seç'
                }
              </span>
            </div>
            
            {selectedMails.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {categoryTitle === "Çöp Kutusu" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('restore')}
                      disabled={isBulkActionLoading}
                      className="h-8"
                    >
                      <Archive className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Geri Yükle</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      disabled={isBulkActionLoading}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Kalıcı Sil</span>
                    </Button>
                  </>
                ) : categoryTitle === "Arşiv" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('unarchive')}
                      disabled={isBulkActionLoading}
                      className="h-8"
                    >
                      <Archive className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Arşivden Çıkar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      disabled={isBulkActionLoading}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Sil</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      disabled={isBulkActionLoading}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Sil</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('archive')}
                      disabled={isBulkActionLoading}
                      className="h-8"
                    >
                      <Archive className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Arşivle</span>
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('star')}
                  disabled={isBulkActionLoading}
                  className="h-8"
                >
                  <Star className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Yıldızla</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isBulkActionLoading} className="h-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('markAsRead')}>
                      Okundu olarak işaretle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('markAsUnread')}>
                      Okunmadı olarak işaretle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('moveToSpam')}>
                      Spam'e taşı
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}
        
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Bu kategoride mail bulunamadı</div>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item._id || `mail-${index}`} className="flex items-center gap-3">
              {isSelectMode && (
                <Checkbox
                  checked={selectedMails.has(item._id)}
                  onCheckedChange={() => toggleSelectMail(item._id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              )}
              <div className="flex-1">
                <MailItem
                  mail={item}
                  onAction={handleMailAction}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelectMail(item._id)
                    } else {
                      // Eğer taslak ise ve onDraftClick varsa, modalı aç
                      if (categoryTitle === "Taslaklar" && onDraftClick) {
                        onDraftClick(item)
                      } 
                      // Eğer planlanan mail ise ve onScheduledMailClick varsa, modalı aç
                      else if (categoryTitle === "Planlanan" && onScheduledMailClick) {
                        onScheduledMailClick(item)
                      } 
                      else {
                        // Kategori bilgisini al ve URL'ye yönlendir
                        const category = getCategorySlug(categoryTitle)
                        router.push(`/mail/${category}/${item._id}`)
                      }
                    }
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
