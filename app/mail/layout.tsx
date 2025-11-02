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

  // Desktop sidebar durumunu localStorage'a kaydet
  const handleDesktopCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebarCollapsedDesktop', collapsed.toString())
      } catch {
        // localStorage'a kayıt başarısız, sessizce devam et
      }
    }
  }

  // Panel resize callback'i - size parametresi ile collapsed durumunu belirle
  const handlePanelResize = (size: number | undefined) => {
    if (size === undefined || size === null) return
    
    // collapsedSize 4 olduğuna göre, size 4'e eşit veya daha küçükse collapsed
    // Küçük bir tolerans ekleyelim (4.5) çünkü resize sırasında tam 4'e gelmeyebilir
    const shouldBeCollapsed = size <= 4.5
    
    // Sadece durum değiştiyse güncelle (sonsuz döngüyü önlemek için)
    if (isCollapsed !== shouldBeCollapsed) {
      handleDesktopCollapse(shouldBeCollapsed)
    }
  }

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

  // Show loading state while checking authentication or before client hydration
  if (!isClient || loading) {
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
                  key={`panel-${isCollapsed ? 'collapsed' : 'expanded'}`}
                  defaultSize={isCollapsed ? 4 : 15}
                  collapsedSize={4}
                  collapsible={true}
                  minSize={10}
                  maxSize={25}
                  onCollapse={() => handleDesktopCollapse(true)}
                  onResize={handlePanelResize}
                  className="border-r"
                >
                  <div className="h-screen overflow-hidden">
                    <Sidebar 
                      key={`sidebar-${isCollapsed}`}
                      isCollapsed={isCollapsed} 
                      onCollapse={handleDesktopCollapse} 
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={82} minSize={30}>
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
