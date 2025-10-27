"use client"

import * as React from "react"
import { Search, Plus, ArrowLeft, X, CheckSquare, RefreshCw, Trash2, Filter, Menu, Info } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MailDisplay } from "@/components/mail-display"
import { MailList } from "@/components/mail-list"
import { SendMailDialog } from "@/components/send-mail-dialog"
import { AdvancedSearchDialog } from "@/components/advanced-search-dialog"
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
import { useMobileSidebar } from "@/app/mail/layout"

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

interface SearchFilters {
  from: string
  to: string
  subject: string
  hasTheWords: string
  doesntHave: string
  isRead: "all" | "read" | "unread"
  hasAttachment: boolean
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
  const [advancedFilters, setAdvancedFilters] = React.useState<SearchFilters>({
    from: "",
    to: "",
    subject: "",
    hasTheWords: "",
    doesntHave: "",
    isRead: "all",
    hasAttachment: false,
  })
  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false)
  const [isSelectMode, setIsSelectMode] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [draftToEdit, setDraftToEdit] = React.useState<any>(null)
  const [mail, { clearSelection }] = useMail()
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const mobileSidebar = useMobileSidebar()
  
  // Redux'tan selectedMail ve selectedAccountEmail'i al
  const selectedMail = useAppSelector((state) => state.mail.selectedMail)
  const selectedAccountEmail = useAppSelector((state) => state.user.selectedAccountEmail)
  const user = useAppSelector((state) => state.user.user)

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

  // Filtre temizleme fonksiyonu
  const handleClearFilters = () => {
    setSearchQuery("")
    setAdvancedFilters({
      from: "",
      to: "",
      subject: "",
      hasTheWords: "",
      doesntHave: "",
      isRead: "all",
      hasAttachment: false,
    })
  }

  // Aktif filtrelere göre badge'ler
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (advancedFilters.from) count++
    if (advancedFilters.to) count++
    if (advancedFilters.subject) count++
    if (advancedFilters.hasTheWords) count++
    if (advancedFilters.doesntHave) count++
    if (advancedFilters.isRead !== "all") count++
    if (advancedFilters.hasAttachment) count++
    return count
  }, [searchQuery, advancedFilters])

  // Mail filtreleme fonksiyonu
  const filteredMails = React.useMemo(() => {
    let filtered = mails
    
    // Seçili hesaba göre filtrele
    // Gönderilenler ve taslaklar için from email'e göre filtrele
    // Diğer klasörler için to email'e göre filtrele
    if (selectedAccountEmail) {
      const folderCategories = ['sent', 'drafts']
      const currentFolder = pathname.split('/')[2] || 'inbox'
      
      filtered = filtered.filter(mail => {
        // Gönderilenler ve taslaklar klasöründe from email'e göre filtrele
        if (folderCategories.includes(currentFolder)) {
          return mail.from?.email === selectedAccountEmail
        }
        // Diğer klasörlerde to email'e göre filtrele
        return mail.to?.some(recipient => recipient.email === selectedAccountEmail)
      })
    }

    // Basic search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(mail => 
        mail.subject.toLowerCase().includes(query) ||
        mail.content.toLowerCase().includes(query) ||
        mail.from?.name?.toLowerCase().includes(query) ||
        mail.from?.email?.toLowerCase().includes(query) ||
        mail.to?.some(recipient => 
          recipient.name?.toLowerCase().includes(query) ||
          recipient.email?.toLowerCase().includes(query)
        )
      )
    }

    // Advanced filters
    if (advancedFilters.from) {
      const fromQuery = advancedFilters.from.toLowerCase()
      filtered = filtered.filter(mail =>
        mail.from?.name?.toLowerCase().includes(fromQuery) ||
        mail.from?.email?.toLowerCase().includes(fromQuery)
      )
    }

    if (advancedFilters.to) {
      const toQuery = advancedFilters.to.toLowerCase()
      filtered = filtered.filter(mail =>
        mail.to?.some(recipient =>
          recipient.name?.toLowerCase().includes(toQuery) ||
          recipient.email?.toLowerCase().includes(toQuery)
        )
      )
    }

    if (advancedFilters.subject) {
      const subjectQuery = advancedFilters.subject.toLowerCase()
      filtered = filtered.filter(mail =>
        mail.subject.toLowerCase().includes(subjectQuery)
      )
    }

    if (advancedFilters.hasTheWords) {
      const wordsQuery = advancedFilters.hasTheWords.toLowerCase()
      filtered = filtered.filter(mail =>
        mail.content.toLowerCase().includes(wordsQuery)
      )
    }

    if (advancedFilters.doesntHave) {
      const exclusionQuery = advancedFilters.doesntHave.toLowerCase()
      filtered = filtered.filter(mail =>
        !mail.content.toLowerCase().includes(exclusionQuery)
      )
    }

    if (advancedFilters.isRead !== "all") {
      const isReadFilter = advancedFilters.isRead === "read"
      filtered = filtered.filter(mail => mail.isRead === isReadFilter)
    }

    if (advancedFilters.hasAttachment) {
      filtered = filtered.filter(mail => 
        mail.attachments && mail.attachments.length > 0
      )
    }

    return filtered
  }, [mails, searchQuery, advancedFilters, selectedAccountEmail, pathname])

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

  // Taslak tıklama fonksiyonu
  const handleDraftClick = (draft: any) => {
    setDraftToEdit(draft)
    setShowSendDialog(true)
  }

  // Mail gönderme dialogu kapandığında taslağı temizle
  const handleSendDialogClose = (open: boolean) => {
    setShowSendDialog(open)
    if (!open) {
      setDraftToEdit(null)
    }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Mail Listesi - Sadece mail seçili değilse göster */}
      {!showMailDetail && (
        <div className="w-full flex-1">
          <Tabs defaultValue="all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-2 gap-2">
              <div className="flex items-center gap-3">
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
                <h1 className="text-lg sm:text-xl font-bold">{categoryTitle}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isRefreshing || mailsLoading}
                      className="h-8"
                    >
                      <RefreshCw className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Yenile</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mail listesini yenile ve yeni mailleri getir</p>
                  </TooltipContent>
                </Tooltip>
                {/* Çöp kutusu temizleme butonu - sadece trash sayfasında göster */}
                {pathname.includes('/trash') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleCleanupTrash}
                        disabled={mailsLoading}
                        className="h-8"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Eski Mailleri Temizle</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>30 günden eski tüm mailleri kalıcı olarak sil</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsSelectMode(!isSelectMode)}
                      className="h-8"
                    >
                      <CheckSquare className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{isSelectMode ? 'Seçimi İptal' : 'Seç'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Birden fazla mail seçmek için seçim modunu aç</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setShowSendDialog(true)}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Yeni Mail</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Yeni bir e-posta oluştur ve gönder</p>
                  </TooltipContent>
                </Tooltip>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200 flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">Tüm E-postalar</span>
                    <span className="sm:hidden">Tümü</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200 flex-1 sm:flex-none"
                  >
                    Okunmamış
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="flex gap-2">
                  <div className="relative flex-1">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={() => setShowAdvancedSearch(true)}
                        className="flex items-center gap-2 relative"
                      >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filtre</span>
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gelişmiş filtreleme seçenekleri: gönderen, alıcı, konu, içerik ve ek filtreleri</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {/* Clear filters button */}
                {(searchQuery || activeFilterCount > 0) && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-muted-foreground">
                      {filteredMails.length} sonuç bulundu
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-7 text-xs"
                    >
                      Filtreleri temizle
                    </Button>
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
                onDraftClick={categoryTitle === "Taslaklar" ? handleDraftClick : undefined}
                onRefresh={handleRefresh}
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
                onDraftClick={categoryTitle === "Taslaklar" ? handleDraftClick : undefined}
                onRefresh={handleRefresh}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Mail Detayı - Sadece mail seçili ise göster */}
      {showMailDetail && selectedMail && (
        <div className="w-full flex-1">
          <div className="flex h-full flex-col">
            {/* Header with back button */}
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 border-b">
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
              <Button onClick={handleBackToList} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Geri</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate">{selectedMail.subject}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
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
        onOpenChange={handleSendDialogClose}
        draftMail={draftToEdit}
        onMailSent={handleRefresh}
      />

      {/* Advanced Search Dialog */}
      <AdvancedSearchDialog
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        onSearch={(filters) => setAdvancedFilters(filters)}
        initialFilters={advancedFilters}
      />
    </div>
  )
}
