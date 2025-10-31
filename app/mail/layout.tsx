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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileState, setMobileState] = useState<MobileSidebarState>('collapsed')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)

  // Toggle function: hidden -> collapsed -> expanded -> hidden
  const toggleMobileSidebar = () => {
    setMobileState(prev => {
      if (prev === 'hidden') return 'collapsed'
      if (prev === 'collapsed') return 'expanded'
      return 'hidden'
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
      <MobileSidebarContext.Provider value={{ mobileState, setMobileState, toggleMobileSidebar }}>
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
                  onCollapse={(collapsed) => setMobileState(collapsed ? 'collapsed' : 'expanded')} 
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
                  defaultSize={15}
                  collapsedSize={4}
                  collapsible={true}
                  minSize={10}
                  maxSize={25}
                  onCollapse={() => setIsCollapsed(true)}
                  onResize={() => setIsCollapsed(false)}
                  className="border-r"
                >
                  <div className="h-screen overflow-hidden">
                    <Sidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
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
