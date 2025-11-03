"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { server } from "@/config"
import { usePathname, useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { logout, switchUser, getAllSessions, removeSession } from "@/redux/actions/userActions"
import { getMailsByCategory, getMailsByLabelCategory, getMailStats, clearSelectedMail, getStarredMails, getScheduledMails } from "@/redux/actions/mailActions"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"
import { getAccountDomainUrl } from "@/config"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Inbox,
  File,
  Send,
  ArchiveX,
  Trash2,
  Archive,
  Users2,
  AlertCircle,
  MessagesSquare,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react"
import { useAppSelector } from "@/redux/hook"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendMailDialog } from "@/components/send-mail-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"

// Dinamik navigation array'leri - mail stats kullanacak
const getMainNav = (mailStats: any) => [
  {
    title: "Gelen Kutusu",
    label: (mailStats?.inbox || 0) > 0 ? (mailStats?.inbox || 0).toString() : "",
    icon: Inbox,
    variant: "default" as const,
    href: "/mail",
    category: "inbox"
  },
  {
    title: "Taslaklar",
    label: (mailStats?.drafts || 0) > 0 ? (mailStats?.drafts || 0).toString() : "",
    icon: File,
    variant: "ghost" as const,
    href: "/mail/drafts",
    category: "drafts"
  },
  {
    title: "Gönderilenler",
    label: "",
    icon: Send,
    variant: "ghost" as const,
    href: "/mail/sent",
    category: "sent"
  },
  {
    title: "Planlanan",
    label: (mailStats?.scheduled || 0) > 0 ? (mailStats?.scheduled || 0).toString() : "",
    icon: Clock,
    variant: "ghost" as const,
    href: "/mail/scheduled",
    category: "scheduled"
  },
  {
    title: "Spam",
    label: (mailStats?.spam || 0) > 0 ? (mailStats?.spam || 0).toString() : "",
    icon: ArchiveX,
    variant: "ghost" as const,
    href: "/mail/spam",
    category: "spam"
  },
  {
    title: "Çöp Kutusu",
    label: (mailStats?.trash || 0) > 0 ? (mailStats?.trash || 0).toString() : "",
    icon: Trash2,
    variant: "ghost" as const,
    href: "/mail/trash",
    category: "trash"
  },
  {
    title: "Arşiv",
    label: (mailStats?.archive || 0) > 0 ? (mailStats?.archive || 0).toString() : "",
    icon: Archive,
    variant: "ghost" as const,
    href: "/mail/archive",
    category: "archive"
  },
]

const getCategoryNav = (mailStats: any) => [
  {
    title: "Yıldızlı",
    label: (mailStats?.starred || 0) > 0 ? (mailStats?.starred || 0).toString() : "",
    icon: Star,
    variant: "ghost" as const,
    href: "/mail/starred",
    category: "starred"
  },
  {
    title: "Sosyal",
    label: (mailStats?.social || 0) > 0 ? (mailStats?.social || 0).toString() : "",
    icon: Users2,
    variant: "ghost" as const,
    href: "/mail/social",
    category: "social"
  },
  {
    title: "Güncellemeler",
    label: (mailStats?.updates || 0) > 0 ? (mailStats?.updates || 0).toString() : "",
    icon: AlertCircle,
    variant: "ghost" as const,
    href: "/mail/updates",
    category: "updates"
  },
  {
    title: "Forumlar",
    label: (mailStats?.forums || 0) > 0 ? (mailStats?.forums || 0).toString() : "",
    icon: MessagesSquare,
    variant: "ghost" as const,
    href: "/mail/forums",
    category: "forums"
  },
  {
    title: "Alışveriş",
    label: (mailStats?.shopping || 0) > 0 ? (mailStats?.shopping || 0).toString() : "",
    icon: ShoppingCart,
    variant: "ghost" as const,
    href: "/mail/shopping",
    category: "shopping"
  },
  {
    title: "Promosyon",
    label: (mailStats?.promotions || 0) > 0 ? (mailStats?.promotions || 0).toString() : "",
    icon: Archive,
    variant: "ghost" as const,
    href: "/mail/promotions",
    category: "promotions"
  },
]

const settingsNav = [
  {
    title: "Hesap",
    label: "",
    icon: Settings,
    variant: "ghost" as const,
    href: getAccountDomainUrl(),
    isExternal: true
  },
  {
    title: "Çıkış Yap",
    label: "",
    icon: LogOut,
    variant: "ghost" as const,
    href: "#",
    isLogout: true
  },
]

interface SidebarProps {
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed: externalIsCollapsed, onCollapse }: SidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, sessions } = useAppSelector((state) => state.user)
  const { mailStats, statsLoading, statsError } = useAppSelector((state) => state.mail)
  const isMobile = useIsMobile()
  
  // localStorage'a kaydetme fonksiyonu
  const saveCollapsedState = useCallback((collapsed: boolean) => {
    if (typeof window === 'undefined') return
    try {
      const storageKey = isMobile ? 'sidebarCollapsedMobile' : 'sidebarCollapsedDesktop'
      localStorage.setItem(storageKey, collapsed.toString())
    } catch {
      // localStorage'a kayıt başarısız, sessizce devam et
    }
  }, [isMobile])
  
  // Internal state - sadece external prop yoksa kullanılır
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(() => {
    // External prop varsa internal state kullanmayacağız
    if (externalIsCollapsed !== undefined) {
      return externalIsCollapsed
    }
    if (typeof window === 'undefined') {
      return false
    }
    try {
      // İlk render'da window.innerWidth ile kontrol et
      const initialIsMobile = window.innerWidth < 768
      const storageKey = initialIsMobile ? 'sidebarCollapsedMobile' : 'sidebarCollapsedDesktop'
      const stored = localStorage.getItem(storageKey)
      return stored === 'true'
    } catch {
      return false
    }
  })
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const selectedAccountEmail = useAppSelector((state) => state.user.selectedAccountEmail)
  
  // External prop varsa onu kullan, yoksa internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
  
  // Setter - external prop varsa onCollapse'u kullan, yoksa internal setter'ı kullan
  const setIsCollapsed = useCallback((collapsed: boolean | ((prev: boolean) => boolean)) => {
    if (onCollapse) {
      // External prop kullanılıyorsa, parent component'e bildir ve localStorage'a kaydet
      const newValue = typeof collapsed === 'function' ? collapsed(isCollapsed) : collapsed
      onCollapse(newValue)
      saveCollapsedState(newValue)
    } else {
      // Internal state kullanılıyorsa, state'i güncelle ve localStorage'a kaydet
      setInternalIsCollapsed(prev => {
        const newValue = typeof collapsed === 'function' ? collapsed(prev) : collapsed
        saveCollapsedState(newValue)
        return newValue
      })
    }
  }, [onCollapse, isCollapsed, saveCollapsedState])
  
  // External prop değiştiğinde internal state'i senkronize et (sadece external prop yoksa)
  useEffect(() => {
    if (externalIsCollapsed !== undefined) {
      // External prop kullanılıyorsa internal state'i güncelleme
      return
    }
    // Sadece external prop yoksa ve isMobile değiştiyse localStorage'dan yükle
    // Desktop'ta bu genellikle çalışmaz çünkü external prop var
  }, [externalIsCollapsed])
  
  // Sidebar yüklendiğinde mail stats'ı çek ve sessions'ı yükle
  useEffect(() => {
    // Load sessions first
    dispatch(getAllSessions())
    
    // Then load mail stats if user exists
    if (user && !mailStats) {
      dispatch(getMailStats())
    }

    // Mevcut kullanıcı oturumunu userSessions'a senkronla ve seçili hesabı ayarla
    try {
      if (user && user.email) {
        const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]")
        const idx = existingSessions.findIndex((s: any) => s.email === user.email)
        const sessionPayload = {
          email: user.email,
          token: null, // token çerezde
          user: user,
          loginTime: new Date().toISOString()
        }
        if (idx >= 0) {
          existingSessions[idx] = sessionPayload
        } else {
          existingSessions.push(sessionPayload)
        }
        localStorage.setItem("userSessions", JSON.stringify(existingSessions))
        // Seçili hesabı garanti altına al (geçişlerden sonra reducer da güncelliyor)
        if (!localStorage.getItem('selectedAccountEmail')) {
          localStorage.setItem('selectedAccountEmail', user.email)
        }
      }
    } catch (_) {}
  }, [dispatch, user, mailStats])
  
  // Seçili hesap değiştiğinde mail stats'ı yenile
  useEffect(() => {
    if (user && selectedAccountEmail) {
      dispatch(getMailStats())
    }
  }, [selectedAccountEmail, dispatch, user])
  
  // Account switch handler
  const handleAccountSwitch = async (email: string) => {
    if (email === "__add_account__") {
      return // Don't switch if "add account" was clicked
    }
    
    // Aynı hesap seçiliyorsa bir şey yapma
    if (email === selectedAccountEmail) {
      return
    }
    
    try {
      // Seçili hesabı kalıcılaştır
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountEmail', email)
      }
      // Sunucuda daha önce oturum açılmışsa, tekrar giriş istemeden aktif hesabı güncelle
      await axios.post(`${server}/auth/switch-active`, { email }, { withCredentials: true })
      // Kullanıcı ve istatistikleri yenile
      window.location.reload()
      toast.success("Hesap değiştirildi")
    } catch (error: any) {
      toast.error("Hesap değiştirilemedi")
    }
  }
  
  // Remove account handler
  const handleRemoveAccount = async (email: string) => {
    try {
      await dispatch(removeSession(email)).unwrap()
      if (email === user?.email) {
        // If we removed the current account, log out
        await handleLogout()
      } else {
        toast.success("Hesap kaldırıldı")
      }
    } catch (error: any) {
      toast.error("Hesap kaldırılamadı")
    }
  }

  // Kategori tıklama handler'ı
  const handleCategoryClick = async (category: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
        
    // Önce seçili maili temizle (mail detay sayfasından çıkarken)
    await dispatch(clearSelectedMail())
    
    // Starred kategorisi için özel action kullan
    if (category === 'starred') {
      dispatch(getStarredMails({
        page: 1,
        limit: 50
      }))
    } 
    // Kategori sayfaları için label category kullan
    else if (['social', 'updates', 'forums', 'shopping', 'promotions'].includes(category)) {
      dispatch(getMailsByLabelCategory({
        category: category,
        page: 1,
        limit: 50
      }))
    } 
    // Planlanan mailler için özel action kullan
    else if (category === 'scheduled') {
      dispatch(getScheduledMails({
        page: 1,
        limit: 50
      }))
    } 
    // Klasör sayfaları için normal category kullan
    else {
      dispatch(getMailsByCategory({
        folder: category,
        page: 1,
        limit: 50
      }))
    }
    
    // Sayfa yönlendirmesi - mail detay sayfasından çıkıp kategori listesine git
    const targetUrl = `/mail${category === 'inbox' ? '' : `/${category}`}`
    router.push(targetUrl)
  }
  
  // Dinamik navigation array'leri
  const mainNav = getMainNav(mailStats)
  const categoryNav = getCategoryNav(mailStats)
  

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success("Başarıyla çıkış yapıldı!")
      router.push("/giris")
    } catch (error: any) {
      toast.error("Çıkış yapılırken bir hata oluştu")
    }
  }

  // Kullanıcı adının baş harflerini al
  const userInitials = user ? `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase() : 'U'
  
  // Kullanıcı profil resmi URL'si
  const getUserProfileImage = (userData?: any) => {
    const targetUser = userData || user;
    if (targetUser?.picture) {
      return targetUser.picture;
    }
    if (targetUser?.profile?.picture) {
      return targetUser.profile.picture;
    }
    return "";
  }

  const renderNavItem = (link: any, index: number, isActive: boolean) => {
    const isLogout = link.isLogout
    const isSettings = link.href?.includes('/settings')
    const isExternal = link.isExternal

    return isLogout ? (
      isCollapsed ? (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9 mx-auto cursor-pointer",
                    "hover:bg-transparent hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Çıkış Yap</AlertDialogTitle>
                  <AlertDialogDescription>
                    Çıkış yapmak istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Çıkış Yap
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
          </TooltipContent>
        </Tooltip>
      ) : (
        <AlertDialog key={index}>
          <AlertDialogTrigger asChild>
            <button
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hover:bg-transparent hover:text-foreground",
                "justify-start w-full cursor-pointer"
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Çıkış Yap</AlertDialogTitle>
              <AlertDialogDescription>
                Çıkış yapmak istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Çıkış Yap
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    ) : isExternal ? (
      isCollapsed ? (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => window.open(link.href, '_blank')}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                "h-9 w-9 mx-auto cursor-pointer",
                !isActive && "hover:bg-transparent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span className="sr-only">{link.title}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          key={index}
          onClick={() => window.open(link.href, '_blank')}
          className={cn(
            buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
            !isActive && "hover:bg-transparent hover:text-foreground",
            "justify-start w-full cursor-pointer"
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
        </button>
      )
    ) : isSettings ? (
      isCollapsed ? (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => router.push(link.href)}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                "h-9 w-9 mx-auto cursor-pointer",
                !isActive && "hover:bg-transparent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span className="sr-only">{link.title}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          key={index}
          onClick={() => router.push(link.href)}
          className={cn(
            buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
            !isActive && "hover:bg-transparent hover:text-foreground",
            "justify-start w-full cursor-pointer"
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
        </button>
      )
    ) : (
      isCollapsed ? (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                handleCategoryClick(link.category, e)
              }}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                "h-9 w-9 mx-auto cursor-pointer",
                !isActive && "hover:bg-transparent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span className="sr-only">{link.title}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
            {!statsLoading && link.label && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                {link.label}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          key={index}
          onClick={(e) => {
            handleCategoryClick(link.category, e)
          }}
          className={cn(
            buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
            !isActive && "hover:bg-transparent hover:text-foreground",
            "justify-start w-full cursor-pointer"
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
          {!statsLoading && link.label && (
            <span
              className={cn(
                "ml-auto",
                isActive && "text-primary-foreground"
              )}
            >
              {link.label}
            </span>
          )}
        </button>
      )
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-background transition-all duration-300 ease-in-out relative z-10 overflow-hidden">
      {/* User Account Section */}
      {!isCollapsed && (
        <div className="px-2 py-3">
          <div className="mb-8">
            <Select value={selectedAccountEmail || user?.email} onValueChange={handleAccountSwitch}>
              <SelectTrigger className="h-auto py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer bg-background w-full border-0 shadow-none">
                <SelectValue>
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserProfileImage()} alt={`${user?.name} ${user?.surname}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-sm font-medium truncate w-full">
                        {user?.name} {user?.surname}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {selectedAccountEmail || user?.email}
                      </span>
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
                <SelectContent>
                  {sessions && sessions.length > 0 ? (
                    sessions
                      .filter((session: any) => session.email !== (selectedAccountEmail || user?.email))
                      .map((session: any) => (
                      <SelectItem key={session.email} value={session.email}>
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={session.email === user?.email ? getUserProfileImage() : getUserProfileImage(session.user)} 
                              alt={`${session.user?.name} ${session.user?.surname}`} 
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {session.user?.name?.[0]}{session.user?.surname?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">
                              {session.user?.name} {session.user?.surname}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {session.email}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                      ))
                  ) : (
                    <SelectItem value={user?.email} disabled>
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={getUserProfileImage()} alt={`${user?.name} ${user?.surname}`} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {user?.name} {user?.surname}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                  <div className="border-t mt-1 pt-2 pb-1 px-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        window.open('/giris', '_blank')
                      }}
                      className="w-full text-sm text-primary hover:text-primary/80 text-center py-2 rounded hover:bg-accent transition-colors"
                    >
                      + Farklı Hesap Ekle
                    </button>
                  </div>
                </SelectContent>
            </Select>
          </div>
          
          {/* Mail Gönderme Butonu */}
          <button
            onClick={() => setIsSendDialogOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 mb-4 text-sm font-medium text-white bg-purple-800 hover:bg-purple-800 rounded-md transition-colors"
          >
            <Send className="h-4 w-4" />
            Yeni Mail
          </button>
        </div>
      )}
      
      {isCollapsed && (
        <div className="py-3">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getUserProfileImage()} alt={`${user?.name} ${user?.surname}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            {/* Collapsed Mail Gönderme Butonu */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsSendDialogOpen(true)}
                    className="flex items-center justify-center w-8 h-8 text-white bg-purple-800 hover:bg-purple-800 rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Yeni Mail</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      
      {/* Main Navigation and Category Navigation Combined */}
      <div className="flex flex-1 flex-col gap-3 py-1 overflow-hidden">
        {/* Main Navigation */}
        <nav className={cn(
          "grid gap-1 pointer-events-auto",
          isCollapsed ? "px-1" : "px-2"
        )}>
          {mainNav.map((link, index) => {
            const isActive = pathname === link.href || (pathname === "/mail" && link.title === "Gelen Kutusu")
            return renderNavItem(link, index, isActive)
          })}
        </nav>
        
        {/* Category Navigation - Right below main navigation */}
        <nav className={cn(
          "grid gap-1 pointer-events-auto",
          isCollapsed ? "px-1" : "px-2"
        )}>
          {categoryNav.map((link, index) => {
            const isActive = pathname === link.href
            return renderNavItem(link, index, isActive)
          })}
        </nav>
      </div>
      
      {/* Settings and Logout - Fixed at Bottom */}
      <div className="flex flex-col gap-3 pb-1 border-t">
        <nav className={cn(
          "grid gap-1",
          isCollapsed ? "px-1" : "px-2"
        )}>
          {settingsNav.map((link, index) => {
            const isActive = pathname.startsWith(link.href)
            return renderNavItem(link, index, isActive)
          })}
        </nav>

      </div>
      
      {/* Send Mail Dialog */}
      <SendMailDialog 
        open={isSendDialogOpen} 
        onOpenChange={setIsSendDialogOpen} 
      />
    </div>
  )
}
