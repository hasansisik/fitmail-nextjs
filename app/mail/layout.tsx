"use client"

import { useState, useEffect } from "react"
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

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.user)

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

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (isClient && !loading && !isAuthenticated) {
      router.push("/giris")
    }
  }, [isAuthenticated, loading, router, isClient])

  // Show loading state while checking authentication or before client hydration
  if (!isClient || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <TooltipProvider delayDuration={0}>
        <div className="h-screen flex flex-row">
          {/* Mobile Sidebar - Left side on mobile */}
          <div className="lg:hidden w-16 border-r">
            <Sidebar isCollapsed={true} onCollapse={setIsCollapsed} />
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
          <div className="lg:hidden flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </TooltipProvider>
    </>
  )
}
