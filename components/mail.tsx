"use client"

import * as React from "react"
import { Search, Plus, ArrowLeft, X, CheckSquare, RefreshCw, Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { MailDisplay } from "@/components/mail-display"
import { MailList } from "@/components/mail-list"
import { SendMailDialog } from "@/components/send-mail-dialog"
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
import { useMail } from "@/app/mail/use-mail"
import { useAppSelector, useAppDispatch } from "@/redux/hook"
import { clearSelectedMail, getMailsByCategory, getMailsByLabelCategory, getMailStats, cleanupTrash } from "@/redux/actions/mailActions"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

interface MailProps {
  mails: ApiMail[]
  mailsLoading?: boolean
  mailsError?: string | null
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  categoryTitle?: string
  listOnly?: boolean // Sadece liste modu
}

export function Mail({
  mails,
  mailsLoading = false,
  mailsError = null,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  categoryTitle = "Gelen Kutusu",
  listOnly = false,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [showSendDialog, setShowSendDialog] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSelectMode, setIsSelectMode] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [mail, { clearSelection }] = useMail()
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  
  // Redux'tan selectedMail'i al
  const selectedMail = useAppSelector((state) => state.mail.selectedMail)

  // Seçili mail var mı kontrol et (listOnly modunda detay gösterme)
  const showMailDetail = !listOnly && selectedMail !== null

  // Geri dönme fonksiyonu
  const handleBackToList = () => {
    clearSelection()
    dispatch(clearSelectedMail())
  }

  // Arama fonksiyonu
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Mail filtreleme fonksiyonu
  const filteredMails = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return mails
    }
    
    const query = searchQuery.toLowerCase()
    return mails.filter(mail => 
      mail.subject.toLowerCase().includes(query) ||
      mail.content.toLowerCase().includes(query) ||
      mail.from?.name?.toLowerCase().includes(query) ||
      mail.from?.email?.toLowerCase().includes(query) ||
      mail.to?.some(recipient => 
        recipient.name?.toLowerCase().includes(query) ||
        recipient.email?.toLowerCase().includes(query)
      )
    )
  }, [mails, searchQuery])

  // Yenileme fonksiyonu - pathname'e göre hangi kategoriyi yenileyeceğini belirle
  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      // Pathname'den kategori/folder bilgisini al
      const pathParts = pathname.split('/')
      const categoryOrFolder = pathParts[2] // /mail/inbox veya /mail/social gibi
      
      if (!categoryOrFolder || categoryOrFolder === '') {
        // Ana mail sayfası - inbox'ı yenile
        await dispatch(getMailsByCategory({
          folder: "inbox",
          page: 1,
          limit: 50
        })).unwrap()
      } else {
        // Folder kategorileri (inbox, sent, drafts, spam, trash, archive)
        const folderCategories = ['inbox', 'sent', 'drafts', 'spam', 'trash', 'archive']
        
        if (folderCategories.includes(categoryOrFolder)) {
          await dispatch(getMailsByCategory({
            folder: categoryOrFolder,
            page: 1,
            limit: 50
          })).unwrap()
        } else {
          // Label kategorileri (social, updates, forums, shopping, promotions)
          await dispatch(getMailsByLabelCategory({
            category: categoryOrFolder,
            page: 1,
            limit: 50
          })).unwrap()
        }
      }
      
      // Stats'ı da yenile
      await dispatch(getMailStats()).unwrap()
      
      toast.success("Mail listesi yenilendi!")
    } catch (error) {
      console.error("Refresh failed:", error)
      toast.error("Mail listesi yenilenemedi")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Çöp kutusu temizleme fonksiyonu
  const handleCleanupTrash = async () => {
    try {
      const result = await dispatch(cleanupTrash()).unwrap()
      toast.success(result.message)
      
      // Çöp kutusu sayfasındaysak listeyi yenile
      if (pathname.includes('/trash')) {
        await dispatch(getMailsByCategory({ folder: "trash", page: 1, limit: 50 })).unwrap()
      }
      
      // Mail istatistiklerini yenile
      await dispatch(getMailStats()).unwrap()
    } catch (error: any) {
      console.error("Cleanup trash failed:", error)
      const errorMessage = typeof error === 'string' ? error : error?.message || "Çöp kutusu temizlenemedi"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="h-full flex">
      {/* Mail Listesi - Sadece mail seçili değilse göster */}
      {!showMailDetail && (
        <div className="w-full">
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{categoryTitle}</h1>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing || mailsLoading}
                  className="h-8"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
                {/* Çöp kutusu temizleme butonu - sadece trash sayfasında göster */}
                {pathname.includes('/trash') && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCleanupTrash}
                    disabled={mailsLoading}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eski Mailleri Temizle
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSelectMode(!isSelectMode)}
                  className="h-8"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {isSelectMode ? 'Seçimi İptal' : 'Seç'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowSendDialog(true)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Mail
                </Button>
                <TabsList>
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Tüm E-postalar
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Okunmamış
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Ara" 
                    className="pl-8 pr-8" 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                      onClick={() => handleSearch("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {filteredMails.length} sonuç bulundu
                  </div>
                )}
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList 
                items={filteredMails} 
                loading={mailsLoading}
                error={mailsError}
                categoryTitle={categoryTitle}
                isSelectMode={isSelectMode}
                onSelectModeChange={setIsSelectMode}
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList 
                items={filteredMails.filter((item) => !item.isRead)} 
                loading={mailsLoading}
                error={mailsError}
                categoryTitle={categoryTitle}
                isSelectMode={isSelectMode}
                onSelectModeChange={setIsSelectMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Mail Detayı - Sadece mail seçili ise göster */}
      {showMailDetail && selectedMail && (
        <div className="w-full">
          <div className="flex h-full flex-col">
            {/* Header with back button */}
            <div className="flex items-center gap-4 p-4 border-b">
              <Button onClick={handleBackToList} variant="outline" size="sm">
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
              <MailDisplay
                mail={selectedMail}
                isMaximized={true}
                onToggleMaximize={handleBackToList}
                onMailSent={handleRefresh}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Send Mail Dialog */}
      <SendMailDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onMailSent={handleRefresh}
      />
    </div>
  )
}
