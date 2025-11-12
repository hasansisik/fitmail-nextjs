"use client"

import * as React from "react"
import { AppLogoWithLoading } from "@/components/app-logo"
import { useState, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector } from "@/redux/hook"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/sidebar"
import { Metadata } from "@/components/metadata"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
 

type MobileSidebarState = 'hidden' | 'collapsed' | 'expanded'

interface MobileSidebarContextType {
  mobileState: MobileSidebarState
  setMobileState: (state: MobileSidebarState) => void
  toggleMobileSidebar: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined)

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext)
  return context
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // localStorage'dan desktop sidebar durumunu yükle
  const getInitialDesktopCollapsedState = (): boolean => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      const stored = localStorage.getItem('sidebarCollapsedDesktop')
      return stored === 'true'
    } catch {
      return false
    }
  }

  // localStorage'dan mobile sidebar durumunu yükle
  const getInitialMobileState = (): MobileSidebarState => {
    if (typeof window === 'undefined') {
      return 'collapsed'
    }
    try {
      const stored = localStorage.getItem('sidebarMobileState')
      if (stored === 'hidden' || stored === 'collapsed' || stored === 'expanded') {
        return stored as MobileSidebarState
      }
      return 'collapsed'
    } catch {
      return 'collapsed'
    }
  }

  const [isCollapsed, setIsCollapsed] = useState(() => getInitialDesktopCollapsedState())
  const [mobileState, setMobileState] = useState<MobileSidebarState>(() => getInitialMobileState())
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)

  // Debounce ve resize tracking için ref'ler - önce tanımlanmalı
  const resizeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const storageSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null) // localStorage kaydetme için ayrı timeout
  const isResizingRef = React.useRef(false)
  const lastResizeSizeRef = React.useRef<number | null>(null)
  const collapseExpandTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const resizeCooldownRef = React.useRef(false) // Resize bittikten sonra kısa bir süre collapse/expand'i engelle
  const cooldownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null) // Cooldown timeout'unu sakla

  // Desktop sidebar durumunu localStorage'a kaydet
  // Resize sırasında tetiklenmemesi için debounce eklendi
  const handleDesktopCollapse = React.useCallback((collapsed: boolean) => {
    // Resize aktifse veya cooldown period'daysa, collapse/expand callback'lerini yok say
    if (isResizingRef.current || resizeCooldownRef.current) {
      return
    }
    
    // Önceki timeout'u temizle
    if (collapseExpandTimeoutRef.current) {
      clearTimeout(collapseExpandTimeoutRef.current)
    }
    
    // Debounce ile state güncelle
    collapseExpandTimeoutRef.current = setTimeout(() => {
      // Resize hala aktifse veya cooldown period'daysa, güncelleme yapma
      if (isResizingRef.current || resizeCooldownRef.current) {
        collapseExpandTimeoutRef.current = null
        return
      }
      
      setIsCollapsed(collapsed)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sidebarCollapsedDesktop', collapsed.toString())
        } catch {
          // localStorage'a kayıt başarısız, sessizce devam et
        }
      }
      collapseExpandTimeoutRef.current = null
    }, 100) // 100ms debounce - daha hızlı
  }, [])

  // Panel resize callback'i - size parametresi ile collapsed durumunu belirle
  // İki aşamalı debounce: resize sırasında hızlı güncelleme (UI feedback), resize bittikten sonra localStorage'a kaydetme
  // Hysteresis (gecikme) mekanizması: toggle sorununu önlemek için
  const handlePanelResize = React.useCallback((size: number | undefined) => {
    if (size === undefined || size === null) return
    
    // Resize aktif olduğunu işaretle
    isResizingRef.current = true
    lastResizeSizeRef.current = size
    
    // Önceki timeout'u temizle
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    // Collapse/expand timeout'unu da temizle (resize öncelikli)
    if (collapseExpandTimeoutRef.current) {
      clearTimeout(collapseExpandTimeoutRef.current)
      collapseExpandTimeoutRef.current = null
    }
    
    // Hysteresis thresholds: daha büyük dead zone ile toggle sorununu önle
    const COLLAPSE_THRESHOLD = 6.0  // Expanded'tan collapsed'a geçmek için
    const EXPAND_THRESHOLD = 7.5    // Collapsed'tan expanded'a geçmek için
    
    // Resize sırasında state'i hızlı güncelle (UI feedback için) - kısa debounce
    const UI_UPDATE_DELAY = 16 // 16ms - bir frame süresi, resize sırasında çok hızlı güncelleme
    
    // Önceki storage save timeout'unu temizle
    if (storageSaveTimeoutRef.current) {
      clearTimeout(storageSaveTimeoutRef.current)
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const currentSize = lastResizeSizeRef.current
      
      if (currentSize === null || currentSize === undefined) {
        isResizingRef.current = false
        resizeTimeoutRef.current = null
        return
      }
      
      // State'i güncelle (resize sırasında UI feedback için)
      setIsCollapsed(prevCollapsed => {
        let shouldBeCollapsed = prevCollapsed
        
        // Mevcut duruma göre farklı threshold'lar kullan
        if (prevCollapsed) {
          // Şu an collapsed ise, expanded'a geçmek için daha büyük bir değer gereksin
          shouldBeCollapsed = currentSize < EXPAND_THRESHOLD
        } else {
          // Şu an expanded ise, collapsed'a geçmek için daha küçük bir değer gereksin
          shouldBeCollapsed = currentSize <= COLLAPSE_THRESHOLD
        }
        
        // Durum değiştiyse güncelle (localStorage'a kaydetme - resize bitince yapılacak)
        return shouldBeCollapsed
      })
      
      resizeTimeoutRef.current = null
    }, UI_UPDATE_DELAY)
    
    // Resize bittikten sonra localStorage'a kaydet (uzun debounce)
    const STORAGE_SAVE_DELAY = 200 // 200ms - resize bitince localStorage'a kaydet
    
    storageSaveTimeoutRef.current = setTimeout(() => {
      // Resize bitti, final state'i localStorage'a kaydet
      const finalSize = lastResizeSizeRef.current
      
      if (finalSize === null || finalSize === undefined) {
        isResizingRef.current = false
        storageSaveTimeoutRef.current = null
        return
      }
      
      setIsCollapsed(prevCollapsed => {
        let shouldBeCollapsed = prevCollapsed
        
        // Mevcut duruma göre farklı threshold'lar kullan
        if (prevCollapsed) {
          shouldBeCollapsed = finalSize < EXPAND_THRESHOLD
        } else {
          shouldBeCollapsed = finalSize <= COLLAPSE_THRESHOLD
        }
        
        // localStorage'a kaydet - sadece durum değiştiğinde
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('sidebarCollapsedDesktop', shouldBeCollapsed.toString())
          } catch {
            // localStorage'a kayıt başarısız, sessizce devam et
          }
        }
        
        return shouldBeCollapsed
      })
      
      // Resize bitti, flag'leri temizle ve cooldown period başlat
      isResizingRef.current = false
      resizeCooldownRef.current = true
      
      // Önceki cooldown timeout'unu temizle
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
      
      // Cooldown period: resize bittikten sonra 200ms boyunca collapse/expand'i engelle
      cooldownTimeoutRef.current = setTimeout(() => {
        resizeCooldownRef.current = false
        cooldownTimeoutRef.current = null
      }, 200)
      
      storageSaveTimeoutRef.current = null
    }, STORAGE_SAVE_DELAY)
  }, [])
  
  // Cleanup debounce timeout on unmount
  React.useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      if (storageSaveTimeoutRef.current) {
        clearTimeout(storageSaveTimeoutRef.current)
      }
      if (collapseExpandTimeoutRef.current) {
        clearTimeout(collapseExpandTimeoutRef.current)
      }
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
    }
  }, [])

  // Mobile sidebar durumunu localStorage'a kaydet
  const handleMobileStateChange = (state: MobileSidebarState) => {
    setMobileState(state)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebarMobileState', state)
      } catch {
        // localStorage'a kayıt başarısız, sessizce devam et
      }
    }
  }

  // Toggle function: hidden -> collapsed -> expanded -> hidden
  const toggleMobileSidebar = () => {
    setMobileState(prev => {
      let nextState: MobileSidebarState
      if (prev === 'hidden') nextState = 'collapsed'
      else if (prev === 'collapsed') nextState = 'expanded'
      else nextState = 'hidden'
      
      // localStorage'a kaydet
      handleMobileStateChange(nextState)
      return nextState
    })
  }

  // Generate dynamic title based on pathname
  const getPageTitle = () => {
    if (pathname === '/mail') {
      return 'Gelen Kutusu - Fitmail'
    } else if (pathname.startsWith('/mail/')) {
      const segments = pathname.split('/')
      if (segments.length === 3) {
        // /mail/category
        const category = segments[2]
        const categoryNames: { [key: string]: string } = {
          'drafts': 'Taslaklar',
          'sent': 'Gönderilenler',
          'spam': 'Spam',
          'trash': 'Çöp Kutusu',
          'archive': 'Arşiv',
          'social': 'Sosyal',
          'updates': 'Güncellemeler',
          'forums': 'Forumlar',
          'shopping': 'Alışveriş',
          'promotions': 'Promosyon',
          'important': 'Önemli',
          'starred': 'Yıldızlı',
          'unread': 'Okunmamış'
        }
        return `${categoryNames[category] || category} - Fitmail`
      } else if (segments.length === 4) {
        // /mail/category/id - This will be handled by the detail page
        return 'Mail Detayı - Fitmail'
      }
    } else if (pathname.startsWith('/mail/settings/')) {
      return 'Ayarlar - Fitmail'
    }
    return 'Fitmail - E-posta Yönetimi'
  }

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Sayfa yüklendiğinde localStorage'dan durumu yükle (client-side only)
  useEffect(() => {
    if (isClient) {
      const storedDesktop = getInitialDesktopCollapsedState()
      const storedMobile = getInitialMobileState()
      if (storedDesktop !== isCollapsed) {
        setIsCollapsed(storedDesktop)
      }
      if (storedMobile !== mobileState) {
        setMobileState(storedMobile)
      }
    }
  }, [isClient]) // Sadece client yüklendiğinde bir kez çalışsın

  // Redirect unauthenticated users to login (only once, avoid loops)
  useEffect(() => {
    if (isClient && !loading && !isAuthenticated && pathname !== '/giris') {
      router.push("/giris")
    }
  }, [isAuthenticated, loading, router, isClient, pathname])

  // Show loading state ONLY while checking authentication or before client hydration
  // Don't show loading for mail data loading - that's handled by mail components
  if (!isClient || (loading && !isAuthenticated)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <AppLogoWithLoading size="md" />
          <div className="h-1 w-20 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  // Don't render mail layout if user is not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      <Metadata 
        title={getPageTitle()}
        description="Fitmail ile e-postalarınızı yönetin, organize edin ve iletişiminizi güçlendirin. Modern arayüzü ve güçlü özellikleriyle e-posta deneyiminizi yeniden tanımlayın."
        keywords="email, e-posta, mail, güvenli email, hızlı email, akıllı email, fitmail"
      />
      <MobileSidebarContext.Provider value={{ mobileState, setMobileState: handleMobileStateChange, toggleMobileSidebar }}>
        <TooltipProvider delayDuration={0}>
          <div className="h-screen flex flex-row">
            {/* Mobile Sidebar - Left side on mobile */}
            <div className={`lg:hidden border-r transition-all duration-300 ease-in-out ${
              mobileState === 'hidden' ? 'w-0 border-0' : 
              mobileState === 'expanded' ? 'w-64' : 
              'w-16'
            }`}>
              {mobileState !== 'hidden' && (
                <Sidebar 
                  isCollapsed={mobileState === 'collapsed'} 
                  onCollapse={(collapsed) => handleMobileStateChange(collapsed ? 'collapsed' : 'expanded')} 
                />
              )}
            </div>
            
            {/* Desktop Resizable Layout */}
            <div className="hidden lg:flex flex-1">
              <ResizablePanelGroup
                direction="horizontal"
                className="h-screen items-stretch"
              >
                <ResizablePanel
                  defaultSize={isCollapsed ? 4 : 18}
                  collapsedSize={4}
                  collapsible={true}
                  minSize={isCollapsed ? 4 : 12}
                  maxSize={30}
                  onCollapse={() => {
                    // Resize aktif değilse ve cooldown period'da değilse collapse callback'ini çalıştır
                    if (!isResizingRef.current && !resizeCooldownRef.current) {
                      handleDesktopCollapse(true)
                    }
                  }}
                  onExpand={() => {
                    // Resize aktif değilse ve cooldown period'da değilse expand callback'ini çalıştır
                    if (!isResizingRef.current && !resizeCooldownRef.current) {
                      handleDesktopCollapse(false)
                    }
                  }}
                  onResize={handlePanelResize}
                  className="border-r transition-all duration-75 ease-out"
                >
                  <div className="h-full overflow-hidden">
                    <Sidebar 
                      isCollapsed={isCollapsed} 
                      onCollapse={handleDesktopCollapse} 
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle 
                  withHandle 
                  className="transition-colors duration-200 ease-in-out hover:bg-accent/50 active:bg-accent"
                />
                <ResizablePanel 
                  defaultSize={82} 
                  minSize={30}
                >
                  <div className="h-full overflow-auto">
                    {children}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
            
            {/* Mobile Content - Remaining width on mobile */}
            <div className="lg:hidden flex-1 overflow-auto relative">
              {children}
            </div>
          </div>
        </TooltipProvider>
      </MobileSidebarContext.Provider>
    </>
  )
}
